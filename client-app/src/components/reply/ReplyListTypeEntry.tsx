import { Link } from "react-router-dom";

export interface ReplyItemType {
  _id: number;
  order_id: number;
  product_id: number;
  rating: number;
  content: string;
}

type Props = {
  reply: ReplyItemType
};

const ReplyEntry = function({ reply }: Props){
  return (
    <li><Link to={`/replies/${reply._id}`}>{reply._id} {reply.content}</Link></li>
  );
};

export default ReplyEntry;