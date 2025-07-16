import React from "react";
import {useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
const axios = require("axios");
axios.defaults.withCredentials = true;

function Transaction(props){
  const navigate = useNavigate();
  
  
  function changeDeletedHistoryState(i,item){
      var profile1 = [...props.profile];
      profile1[props.player.id].history[i].deletedHistory = true;
      profile1[props.player.id].cost = Number(profile1[props.player.id].cost) - item.amount;
      
      
    if(item.sharedHow === "equally"){
      if (item.sharing.length === 0 || item.sharing.length === props.profile.length + 1){
        let share = Number(item.amount) / props.profile.length;
        for (var i = 0; i < props.profile.length; i++){
          profile1[props.player.id].owe[i] -= share;
      }
    }
      else{
      let share = Number(item.amount) / item.sharing.length;
      for (var i=0;i<item.sharing.length;i++){
          profile1[props.player.id].owe[item.sharing[i].value] -= share;
      }
    }
  }
   else{
    var uneq = Object.values(item.unequalDivision);
    if (item.sharing.length === 0 || item.sharing.length === props.profile.length + 1){
      for (var i=0;i<uneq.length;i++){
        profile1[props.player.id].owe[i] -= Number(uneq[i]);
    }
  }
    else{
    for (var i=0;i<item.sharing.length;i++){
        profile1[props.player.id].owe[item.sharing[i].value] -= Number(uneq[item.sharing[i].value]);
    }
  }
  }
    var share1 = new Array(profile1.length).fill(0);
    var actualOwe1 = [];
    [actualOwe1,share1] = props.calculateActualOweAndShare(actualOwe1,profile1,share1);
    props.setLoading(true);
    axios.post('https://bill-split-backend-mcgw.onrender.com/api/billsplit', {
              updatedDetails: profile1
          })
          .then(function (response) {
              if(response.status === 200){
                 if (response.data.status === "ok"){
                     console.log("successfully saved");
                     props.setLoading(false);
                     props.setactualOwe(actualOwe1);
                     props.setShare(share1);
                     props.setProfile(profile1);
                    }
                    else if(response.data.status === "go to login"){
                         navigate("/login");
                       }  
                  }
          })
         .catch(function (error) {
                navigate("/error");
          });

    }

  return (
    <div>
           {props.player.history.map((item,i)=>{
             return (
               <div className="history-box" style={item.deletedHistory===true?{color:"red"}:null}>
               <Row>
               <Col lg={6} md={6} sm={6} xs={6}>Date:</Col>
               <Col lg={6} md={6} sm={6} xs={6} ><p>{item.date}</p></Col>
               </Row>
               <Row>
               <Col lg={6} md={6} sm={6} xs={6}>Purpose:</Col>
               <Col lg={6} md={6} sm={6} xs={6}><p>{item.title}</p></Col>
               </Row>
               <Row>
               <Col md={6} sm={6} xs={6}>Amount:</Col>
               <Col md={6} sm={6} xs={6}><p>{item.amount}</p></Col>
               </Row>
               <Row>
               <Col lg={6} md={6} sm={6} xs={6}>Shared by:</Col>
               <Col lg={6} md={6} sm={6} xs={6}><p style={{whiteSpace:"pre-wrap"}}>{item.sharedHow === "equally"?
               item.sharing.length !== 0 && item.sharing.length !== props.profile.length + 1 && item.sharing.length !== props.profile.length?
               item.sharing.map(piece=>{return piece.label + ", ";}):
               "Everyone":
               null}
               {item.sharedHow === "unequally"?
               item.sharing.length !== 0?
               item.sharing.map(piece=>{return piece.label + "=" + Object.values(item.unequalDivision)[piece.value]+"\n";}):
               Object.keys(item.unequalDivision).map((piece,i)=>{return piece+"="+Object.values(item.unequalDivision)[i]+"\n";}):
               null}</p></Col>
               </Row>
               <Row>
               <Col lg={6} md={6} sm={6} xs={6}>Shared How?</Col>
               <Col lg={6} md={6} sm={6} xs={6}><p>{item.sharedHow}</p></Col>
               </Row>
              
              {item.deletedHistory===false?<FontAwesomeIcon icon={faTrashAlt} onClick={()=>{return changeDeletedHistoryState(i,item)}} className="delete-icon"/>:null}
               </div>
           );
           })}
       
       
    </div>
  );
}

export default Transaction;
