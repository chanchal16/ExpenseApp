// import {db,timestamp} from './config'  
    const db = firebase.firestore();
    //get the btn element
    const btnexpenseref = document.querySelector('#btnAddExpense');
    const resetBtn = document.querySelector('#reset');
    //get the input element ref
    const inputref = document.querySelector('#inputAmount');
    const descref = document.querySelector('#inputdesc');
    const tableref = document.querySelector('#table');     //ul ref
    const headingEl = document.querySelector('#output');    //to show total expense

    //listen to click event
    btnexpenseref.addEventListener('click',addToTotalExpense);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
    
    //init value of expense to 0
   let totalExpense = 0;

    //set the heading element to totalexpense
    headingEl.textContent = totalExpense;

    

    function renderList(){
        tableref.innerHTML='';
        db.collection('budget')
        .doc('expenses')
        .collection('xpenseArr')
        .orderBy('timestamp','desc')
        .get()
        .then((snapshot)=>{
            snapshot.forEach((item)=>createListItem(item));   
        })
        
        generateTotalExpenses();
    }

    // This method fetches total expenses from firebase, and renders total expenses element in our DOM
    function generateTotalExpenses() {
        db.collection('budget')
        .doc('totalexpenses')
        .get()
        .then((doc) => {
            if (doc.exists) {
            totalExpense = doc.data().totalExpense;
    
            // rendering the respective element
            // headingEl.innerHTML = totalExpenses;
            const someText = `Total: ${totalExpense}`
            headingEl.textContent = someText;
            }
        });
    }

     // This function updates total expenses document value on firebase
     function updateTotalExpenses(expense, del) {
        if (del) {
        db.collection('budget').doc('totalexpenses')
            .set({
            totalExpense: totalExpense - expense,
            });
            console.log(totalExpense);
        } else {
        db.collection('budget').doc("totalexpenses")
            .set({
            totalExpense: totalExpense + expense,
            });
            console.log(totalExpense);
        }
        db.collection('budget').doc("totalexpenses")
        .get()
        .then((doc) => {
        if (doc.exists) {
            totalExpense = doc.data().totalExpense;
            //set the heading element to totalexpense
            const someText = `Total: ${totalExpense}`
            headingEl.textContent = someText;

        }
        });
        
    }

     //delete item
     function deleteItem(id,amount){
        let confirmDelete = confirm("Are you sure you want to delete this item?");
        if (confirmDelete) {
            updateTotalExpenses(amount,true);
            db.collection('budget')
            .doc('expenses')
            .collection('xpenseArr')
            .doc(id)
            .delete()
            .then(()=>{
                alert('successfully deleted');
                renderList();
            })
            .catch((err) => alert(err.message));
        }
    }

     //view layer
     function createListItem(doc){
        const listItem = document.createTextNode(doc.data().desc);
        const listAmount = document.createTextNode(doc.data().amount);
        const descDiv = document.createElement('div');
        const elmDiv = document.createElement('div');
        const deleteBtn = document.createElement("button");
        const del = document.createTextNode('Delete');
        const span = document.createElement("i");
        const h5 = document.createElement('h5');

        //desc div
        descDiv.classList.add('d-flex');
        descDiv.classList.add('flex-column');
        
        
        deleteBtn.classList.add('btn');
        deleteBtn.classList.add('btn-danger');
        deleteBtn.classList.add('btn-sm');
        deleteBtn.classList.add("deleteBtn");
        deleteBtn.addEventListener("click", () =>
            deleteItem(doc.id, doc.data().amount)

        );

        span.classList.add("px-5");
        deleteBtn.appendChild(del);
        // rendering the respective elements
        //desc div
        h5.appendChild(listItem);
        descDiv.appendChild(h5);
        
        span.appendChild(listAmount);
        // span.appendChild(deleteBtn);

        //btn nd amount div
        elmDiv.appendChild(span);
        elmDiv.appendChild(deleteBtn);

      
        const list = document.createElement('li');
        list.classList.add("list-group-item");
        list.classList.add('d-flex');
        list.classList.add('justify-content-between');
        list.appendChild(descDiv);
        list.appendChild(elmDiv);
        tableref.appendChild(list);

    }


    //on btn click add inputAmount to total expense
    function addToTotalExpense(){
        

        //read value from input
        //get the value of input
        const textAmount = inputref.value;
        const textDesc = descref.value;

        //convert it to number
        const expense = parseInt(textAmount,10);
        headingEl.innerHTML = '';
        updateTotalExpenses(expense);

        //add data to db
        db.collection('budget').doc('expenses').collection('xpenseArr').add({
            amount:expense,
            desc:textDesc,
            timestamp:timestamp
        })

        
        //add expense to total
        // totalExpense = totalExpense + expense;
        // console.log('totalexpense',totalExpense);

        //read values frm db 
        tableref.innerHTML='';
        db.collection('budget').doc('expenses').collection('xpenseArr')
        .orderBy('timestamp','desc')
        .get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>createListItem(doc));
        })


        //clear the input
        document.getElementById('inputAmount').value='';
        document.getElementById('inputdesc').value='';
    }

    
 // Reset Button
 resetBtn.addEventListener("click", () => {
    tableref.innerHTML = "";
    descref.value = "";
    inputref.value = "";
    db.collection('budget')
      .doc("expenses")
      .collection("xpenseArr")
      .get()
      .then((response) => {
        response.forEach((doc) => doc.ref.delete());
      });
  
    db.collection('budget')
      .doc("totalexpenses")
      .set({
        totalExpense: 0,
      })
      .then(() => {
        generateTotalExpenses();
        alert("Cleared all the data from storage!");
      });
  });    