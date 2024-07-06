import { useEffect, useState } from "react";

interface QuantityProps {
  min?: number;
  max?: number;
  setter: (quantity: number) => void;
}

const QuantityInput = function({ min=1, max=100, setter }: QuantityProps) {
  const [quantity, setQuantity] = useState(min);
  
  const onIncrease = () => {
    if(quantity < max){
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };
  const onDecrease = () => {
    if(quantity > min){
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  useEffect(() => {
    setter(quantity);
  }, [quantity]);

  
  return (
    <>
      <label htmlFor="quantity">수량</label>
      <button type="button" onClick={ onDecrease }>-</button>     
      <input
        type="number"
        id="quantity"
        name="quantity"
        min={1}
        value={quantity}
        max={max}
        readOnly
      />
      <button type="button" onClick={ onIncrease }>+</button>
    </>
  );
}

export default QuantityInput;