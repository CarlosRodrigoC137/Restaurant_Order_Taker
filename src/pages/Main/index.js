import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api, BASE_URL } from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { StyledLink } from "../../FormComponents";

const socket = io(BASE_URL);

export default function Main(){
  const {token} = useAuth();
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const [options, setOptions] = useState([]);
  const [order, setOrder] = useState([]);
  const [openTable, setOpenTable] = useState(false);
  const [allTables] = useState([
    "A", "B", "C", "D", "E"
  ])
  const [clientTable, setClientTable] = useState("");

  useEffect(()=> getOptions(), [token]);

  function getOptions(){
    const promise = api.get();
    
    promise.then((response)=>{
      console.log(response.data);
      setOptions(response.data);
    }).catch ((error)=> {
      console.log(error);
      alert("Could not load options");
    })
  }

  async function handleOption(id){
    if(order.includes(id)){
      const arr = order.filter((item) => {
        return item !== id
      })
      setOrder(arr);
      return
    }
    let arr = [...order];
    arr.push(id);
    setOrder([...arr]);
  }

  function handleTable(table){
    setClientTable(table);
    setOpenTable(!openTable);
  }

  async function submitOrder(e){
    e.preventDefault();
    setDisabled(true);

    if(order.length === 0){
      alert("Make some choices from Menu ;)");
      setDisabled(false);
      return;
    }
    if(!token){
      confirmAction();
      return;
    }
    try {
      await api.postOrder({
      table: clientTable,
      optionsIds: order
      }, token);
      socket.emit("new_order");
      navigate("/menu/waiting");
    } catch (error) {
      console.log(error);
      alert("could not place order. Try again");
    }
  }

  function confirmAction() {
    let confirmAction = window
    .confirm("Not logged yet, pls do Log in before ;)");
    
    if (confirmAction) {
      setDisabled(false);
      navigate("/");
    }
    setDisabled(false);
    return;
  }

  if(options.length === 0){
    return <div>Loading...</div>
  }

  return (
    <>
      <Link to={"/"}>First time? Create an account!</Link>
      <StyledLink to={"/adm/signin"}>Adm-login</StyledLink>
      <div>Main</div>
      <form onSubmit={(e)=>submitOrder(e)}>
        <input 
          placeholder="Your Table"
          type="text"
          onChange={()=>{}}
          onClick={() => setOpenTable(!openTable)}
          name="category"
          value={clientTable}
          required
        />
        { 
        openTable?
        <div>
          {
            allTables.map((table) =>
              <div key={table} onClick={()=> handleTable(table)}>
                {table}
              </div>
            )
          }
        </div>
        :
        <></>
        }
        <button type="submit" disabled={disabled}>Send Order</button>
      </form>
      {
        options.map((option)=> 
          <div key={option.id}>
            {option.name}
            <button onClick={() => handleOption(option.id)}>
              {`Pedir ${option.id}`}
            </button>
          </div>
        )
      }
    </>
  );
}