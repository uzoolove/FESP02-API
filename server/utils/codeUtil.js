import _ from 'lodash';
import logger from '#utils/logger.js';

const codeUtil = {
  async initCode(clientId, db){
    logger.log('db 접속 후 코드 조회');
    logger.log(clientId);
    global[clientId] = {};
    global[clientId].codeList = await db.code.find().toArray();
    global[clientId].codeList.forEach(code => _.sortBy(code.codes, 'sort'));
    global[clientId].codeFlatten = _.flatten(_.map(global[clientId].codeList, 'codes')).reduce((codes, item) => {
      return {
        ...codes,
        [item['code']]: item
      };
    }, {});
    global[clientId].codeObj = codeUtil.generateCodeObj(global[clientId].codeList);
  },

  async initConfig(clientId, db){
    global[clientId].config = (await db.config.find().toArray()).reduce((configs, item) => {
      return {
        ...configs,
        [item['_id']]: item
      };
    }, {});
  },

  // getCodeList() {
  //   return global.codeList;
  // },

  getCodeObj(clientId) {
    return global[clientId].codeObj;
  },

  getCodeFlatten(clientId) {
    return global[clientId].codeFlatten;
  },

  // getCode(_id) {
  //   return global.codeObj[_id];
  // },
  
  // getCodeValue(code){
  //   return this.getCodeAttr(code, 'value');
  // },

  getCodeAttr(clientId, code, attr){
    return global[clientId].codeFlatten[code] && global[clientId].codeFlatten[code][attr];
  },

  // 트리 구조의 코드일 경우 자식 코드를 포함하는 중첩 구조로 변경
  createNestedStructure(data) {
    const sortedData = _.sortBy(data, ['depth', 'sort']);
    const nestedData = _.filter(sortedData, { depth: 1 });
  
    function addChild(parent) {
      const children =  _.filter(sortedData, { parent: parent.code });
      if(children.length > 0){
        parent.sub = children;
      }
    }

    for (const item of sortedData) {
      addChild(item);
    }
  
    return nestedData;
  },

  generateCodeObj(codeArray) {
    const codeObj = {};
    _.cloneDeep(codeArray).forEach(code => {
      codeObj[code._id] = code;
      if(code.codes[0].depth){
        code.codes = this.createNestedStructure(code.codes);
      }
    });
    return codeObj;
  },
};

export default codeUtil;