
// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    // This prototype method calculates the percentage...
    Expense.prototype.calcPercentage = function(totalIncome) {
        // only calculate percentage if it's above zero
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    // And the percentage is returned in this method
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;   
    }

    // best not to use variables like this and instead use a data structure
    // like an object
    //    var allExpenses = [];
    //    var allIncomes = [];
    //    var totalExpenses = 0;

    var calculateTotal = function(type){
        
        var sum = 0;

        // figured this out on my own before the video ;)
        // just didnt put it in it's own private method
        data.allItems[type].forEach(function(current, index, array) {
            //sum = sum + current.value;
            sum += current.value;
        });
        
        data.totals[type] = sum;
        
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            // [1 2 3 4 5 6], next ID = 6
            // using an array for new items would not work
            // as later on, items would be deleted from this list
            // and this would mean two elements may get the same number
            // so best practice is to write what you want to happen
            // ID = last ID + 1
            
            // code to create new ID for new item in the list
            // Retrieve the last stored item in the list
            // Only want the ID of that item, not the object
            
            // If there are no items in the array, do not subtract 1 from 0
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            // the type is recieved when the function is called
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            
            // need type and ID to know which item in the data structure to delete
            
            // id = 6
            // data.allItems[type][id];
            // ids = [1,2,4,6,8]
            // index = 3
            
            // would provide a new array in the IDs var with the same length
            // as the data array. Is useful for creating an index of the original array
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            // only gets activated if the index is in the array
            // and not -1 (false)
            if (index !== -1) {
                // first property in the array is the position in which you
                // wish to remove the element from the array
                // the second property is the number of elements to delete
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
            
            // 1. Calculate total income and expenses
            //calculateTotal(type);
            calculateTotal('inc');
            calculateTotal('exp');
            
            // 2. Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. Calculate the percentage of income that we spent
            // only calculate the percentage if the income is greater than 0
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                // non existant percentage
                data.percentage = -1;
            }
            
            
            
            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
        },
        calculatePercentages: function(){
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            // for each expense in the object, calculate the expense
            // using the method within that object
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);                    
            });
            
        },
        // map method is good to get the value in a loop, and store it
        // for each value in the object or array
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function (cur){
                return cur.getPercentage();
            });
            return allPerc;    
        
        },
        
        getBudget: function(){
//            return data.totals;
//            return data.budget;
//            return data.percentage;
            
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    };
    
})();


//UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
            var numSplit, int, dec, type;
            
            /*
            + or - before number
            exactly 2 decimal points
            comma seperating the thousands
            
            2310.4567 -> = 2,310.46
            2000 -> + 2,000.00
            */
            
            num = Math.abs(num);
            // not a method of math object, method of number prototype
            // puts exactly two decimal numbers, on the number called by method
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            // add a comma if the number is over 1000
            if (int.length > 3){
                // gives the first part of the number, to add the comma to
                // then the rest of the number
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
            }
            dec = numSplit[1];

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function(){
            
            return {
            type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
            description: document.querySelector(DOMStrings.inputDescription).value,
            //parseFloat method converts string to float (number with decimals)
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var HTML, newHTML, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc'){
                
            element = DOMStrings.incomeContainer;
                
            HTML = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp'){
                
            element = DOMStrings.expensesContainer;
                
            HTML = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            // Replace the placeholder text with some actual data
            // Strings have their own menthods, just like Arrays
            newHTML = HTML.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber (obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            
            // can only remove elements in HTML that are children of a parent
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            
            //Clear description and value fields after adding an item
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            // Call the slice method from the global function constructor for Arrays.
            // The slice method usually is used on an array and returns an array
            // but as the "querySelectorAll" method returns a list and not an array
            // the slice method is called and used on the field variable, in order 
            // to convert it to an array.
            fieldsArray = Array.prototype.slice.call(fields);
            
            // use for each method for arrays
            // use a callback function so it is applied to each of the elements
            // in the array. The callback function can recieve up to 3 arguments
            // similar to callback function in event listener. 
            // current = current value in array
            // index = the index of the current element being processed
            // array = th current array calling the function
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');    
            
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages){
            
            // use event delegation to detect when child is added with expenses perc label
            // this returns node list, and as this isnt an array, this does not have the for each method
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            // rather than using slice method this uses a for each function to convert the node list
            // to an array
            nodeListForEach(fields, function (current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            //array for month names
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMStrings;
        }
    };
                    
})();




//GLOBAL APP CONTROLLER
var appController = (function(budgetCtrl, UICtrl){
    
    var DOM = UICtrl.getDOMstrings();
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {

            // if Enter is pressed, 13 is the keycode for enter
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        // event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2  Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI   
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages= function() {
        
        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the user interface
        UICtrl.displayPercentages(percentages);
    }
    

    var ctrlAddItem = function(){
        
        var input, newItem, addItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        // Checks if description is not empty and value is a number
        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear Fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();
        }

        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        // read the target element from the container using the target
        // retrieve ID and store to variable. This contains the type and unique ID
        // as generated in the HTML variable (add list item)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        // if an itemID is clicked
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            // converted from string to int so can then use it for delete item method
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
        }
        
    };
    
    return {
        init: function(){
            console.log('application has started');
            UICtrl.displayMonth();
            // Initialise by setting all values on the page to zero
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            
            // Set all values on page to blank
            
            //this.domTest();
        },
        domTest: function(){
            //var domtest = UICtrl.getInput();
            //var newItem = budgetCtrl.addItem(domtest.type, domtest.description, domtest.value);
            //var newItem = budgetCtrl.addItem(domtest.type, domtest.description, domtest.value);
            //console.log(domtest);
            //console.log(newItem);
        }
    };
    
    
})(budgetController,UIController);


appController.init();









