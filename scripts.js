const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances: transactions")) || [];
    },
    set(transactions){
        localStorage.setItem("dev.finances: transactions", JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index){
        Transaction.all.splice(index, 1);
        App.reload();
    },
        
    edit(index){ //Atualizar dado do localStorage

        Modal.open();

        let description = Transaction.all[index].description;

        let date = String(Transaction.all[index].date).split("/");
        date = date[2] + "-" + date[1] + "-" + date[0];

        let tamAmount = String(Transaction.all[index].amount).length - 2;

        let amount = [
            String(Transaction.all[index].amount).slice(0, tamAmount), 
            String(Transaction.all[index].amount).slice(tamAmount, String(Transaction.all[index].amount).length)
        ];

        let amountFinal = Number(amount[0]+ "." + amount[1]);
                 
        document.getElementById("description").value = description;
        document.getElementById("amount").value = amountFinal; 
        document.getElementById("date").value = date; // precisa receber ano/mes/dia

        Transaction.remove(index);

        App.reload();
    },

    incomes(){
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0 ) {
                income += transaction.amount;
            }

        });
        
        return income;
    },
    expenses(){
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0 ) {
                expense += transaction.amount;
            }

        });
        
        return expense;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();
    }   
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td style="text-align: center;">
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            <img onclick="Transaction.edit(${index})" src="./assets/plus.svg" alt="Editar transação">
        </td>
        `;
        
        return html;
    },
    
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatAmount(value){
        // value = Number(value.replace(/\,\./g, "")) * 100;
        value = Number(value) * 100;

        return value;
    },

    formatDate(date){
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, ""); //trocar tudo que nao for numero por ""
    
        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

       return signal + value;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date} = Form.getValues();

        if(description.trim()==="" || amount.trim()==="" || date.trim()===""){
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues(){
        let { description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event){
        event.preventDefault(); // evitar o comportamento default do submit

        try {   
            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction);
            Form.clearFields();
            Modal.close();            
        } catch (error) {
            alert(error.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}

App.init();