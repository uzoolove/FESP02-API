import logger from '#utils/logger.js';

class ProductModel {
  constructor(db, model){
    this.db = db;
    this.model = model;
  }
  
  // 상품 검색
  async findBy({ sellerId, search={}, sortBy={}, page=1, limit, depth, showSoldOut, userId }){
    const query = { active: true, ...search };

    if(sellerId){
      // 판매자가 조회할 경우 자신의 상품만 조회
      query['seller_id'] = sellerId;
    }else{
      // 일반 회원이 조회할 경우
      query['show'] = true;
      if(depth !== 2 && !showSoldOut){ // 옵션 목록 조회가 아니고 showSoldOut이 true로 전달되지 않는 경우 품절된 상품 제외
        query['$expr'] = {
          '$gt': ['$quantity', '$buyQuantity']
        };
      }
    }

    logger.trace(query);

    const skip = (page-1) * limit;
    const totalCount = await this.db.product.countDocuments(query);

    const pipeline = [
      // Match stage to filter documents based on query
      { $match: query },

      // 판매자 정보 추가
      {
        $lookup: {
          from: "user",
          localField: "seller_id",
          foreignField: "_id",
          as: "seller"
        }
      },
      // { $unwind: "$seller" },

      { 
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true
        }
      },

      
      // 후기 목록
      {
        $lookup: {
          from: "reply",
          localField: "_id",
          foreignField: "product_id",
          as: "replyItems"
        }
      },      
      {
        $addFields: {
          replies: { $size: "$replyItems" }
        }
      },

      // 후기 점수 평균 계산
      {
        $addFields: {
          rating: {
            $cond: {
              if: { $gt: [{ $size: "$replyItems" }, 0] }, // replyItems 배열이 존재하고 요소가 있을 때
              then: { $avg: "$replyItems.rating" },        // rating 계산
              else: "$$REMOVE"                             // 필드를 제거
            }
          }
        }
      },

      // 북마크 목록
      {
        $lookup: {
          from: "bookmark",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$productId"] },
                    { $eq: ["$type", "product"] } // 상품에 대한 북마크는 type이 product로 지정됨
                  ]
                }
              }
            }
          ],
          as: "bookmarkItems"
        }
      },

      
      {
        $addFields: {
          bookmarks: { $size: "$bookmarkItems" }, // 북마크 목록 수
          // bookmarked: { // 내가 북마크한 상품인지 여부
          //   $cond: {
          //     if: { $in: [userId, "$bookmarkItems.user._id"] },
          //     then: true,
          //     else: false
          //   }
          // }
          myBookmarkId: { // 내가 북마크한 상품일때 북마크 id
            $map: {
              input: {
                $filter: {
                  input: "$bookmarkItems",
                  as: "bookmark",
                  cond: { $eq: ["$$bookmark.user._id", userId] } // userId가 북마크한 항목 필터링
                }
              },
              as: "bookmark",
              in: "$$bookmark._id"
            }
          }
        }
      },

      { 
        $unwind: {
          path: "$myBookmarkId",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: "product",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$extra.depth", 2] }, // 옵션 상품 중에서
                    { $eq: ["$extra.parent", "$$productId"] }, // 부모 상품과 일치하는 상품
                  ]
                }
              }
            }
          ],
          as: "optionItems"
        }
      },
      {
        $addFields: {
          options: { $size: "$optionItems" }
        }
      },

      { 
        $project: { 
          content: 0,
          bookmarkItems: 0,
          replyItems: 0,
          optionItems: 0,
          'seller.password': 0,
          'seller.refreshToken': 0,
          'seller.type': 0,
          'seller.loginType': 0,
          'seller.createdAt': 0,
          'seller.updatedAt': 0,
        } 
      },
      
      // 정렬
      { $sort: sortBy },

      { $skip: skip },
      { $limit: limit || 100 }, // limit가 없을 경우 100개 까지만 반환);
    ];

    const list = await this.db.product.aggregate(pipeline).toArray();


    // const skip = (page-1) * limit;
    
    // logger.debug(query);
    // const totalCount = await this.db.product.countDocuments(query);
    // let list = await this.db.product.find(query).project({ content: 0 }).skip(skip).limit(limit).toArray();
    // // const list = await this.db.product.find(query).project({ content: 0 }).skip(skip).limit(limit).sort(sortBy).toArray();
    // for(const item of list){
    //   if(item.extra?.depth === 2){
    //     item.replies = (await this.model.reply.findBy({ product_id: item._id }));
    //   }else{
    //     item.replies = (await this.model.reply.findBy({ product_id: item._id })).length;
    //   }
    //   item.bookmarks = (await this.model.bookmark.findByProduct(item._id)).length;
    //   if(item.extra?.depth === 1){ // 옵션이 있는 상품일 경우
    //     item.options = (await this.findBy({ search: { 'extra.parent': item._id }, depth: 2 })).length;
    //   }
    //   // 셀러 정보 조회
    //   item.seller = await this.model.user.findById(item.seller_id);
    // }

    // const sortKeys = [];
    // const orders = [];
    // for(const key in sortBy){
    //   sortKeys.push(key);
    //   orders.push(sortBy[key] === 1 ? 'asc' : 'desc');
    // }

    // list = _.orderBy(list, sortKeys, orders);

    const result = { item: list };
    if(depth !== 2){  // 옵션 목록 조회가 아닐 경우에만 pagination 필요
      result.pagination = {
        page,
        limit,
        total: totalCount,
        totalPages: (limit === 0) ? 1 : Math.ceil(totalCount / limit)
      };
    }

    logger.debug(list.length);
    return result;
  }

  // 상품 상세 조회
  async findById({ _id, userId }){
    logger.trace(arguments);

    const item = await this.db.product.aggregate([
      { $match: { _id }},
      // 판매자 정보 추가
      {
        $lookup: {
          from: "user",
          localField: "seller_id",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: "$seller" },
      
      // 후기 목록
      {
        $lookup: {
          from: "reply",
          localField: "_id",
          foreignField: "product_id",
          as: "replies"
        }
      },

      // 후기 점수 평균 계산
      {
        $addFields: {
          rating: {
            $cond: {
              if: { $gt: [{ $size: "$replies" }, 0] }, // replyItems 배열이 존재하고 요소가 있을 때
              then: { $avg: "$replies.rating" },        // rating 계산
              else: "$$REMOVE"                             // 필드를 제거
            }
          }
        }
      },

      // 북마크 목록
      {
        $lookup: {
          from: "bookmark",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$productId"] },
                    { $eq: ["$type", "product"] } // 상품에 대한 북마크는 type이 product로 지정됨
                  ]
                }
              }
            }
          ],
          as: "bookmarkItems"
        }
      },
      {
        $addFields: {
          bookmarks: { $size: "$bookmarkItems" },
          // bookmarked: { // 내가 북마크한 상품인지 여부
          //   $cond: {
          //     if: { $in: [userId, "$bookmarkItems.user._id"] },
          //     then: true,
          //     else: false
          //   }
          // },
          myBookmarkId: { // 내가 북마크한 상품일때 북마크 id
            $map: {
              input: {
                $filter: {
                  input: "$bookmarkItems",
                  as: "bookmark",
                  cond: { $eq: ["$$bookmark.user._id", userId] } // userId가 북마크한 항목 필터링
                }
              },
              as: "bookmark",
              in: "$$bookmark._id"
            }
          }
        }
      },

      { 
        $unwind: {
          path: "$myBookmarkId",
          preserveNullAndEmptyArrays: true
        }
      },

      // 옵션이 있는 상품일 경우 옵션
      {
        $lookup: {
          from: "product",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$extra.depth", 2] }, // 옵션 상품 중에서
                    { $eq: ["$extra.parent", "$$productId"] }, // 부모 상품과 일치하는 상품
                  ]
                }
              }
            }
          ],
          as: "options"
        }
      },

      { 
        $project: { 
          bookmarkItems: 0,
          'seller.password': 0,
          'seller.refreshToken': 0,
          'seller.type': 0,
          'seller.loginType': 0,
          'seller.createdAt': 0,
          'seller.updatedAt': 0,
          'replies.order_id': 0,
          'replies.product_id': 0,
          'bookmarks.type': 0,
          'bookmarks.target_id': 0
        } 
      },
    ]).next();

    logger.debug(item);
    return item;
  }

}
  

export default ProductModel;