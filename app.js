// BUDGET CONTROLLER
let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    };

    let calculateTotal = function (type) {
        let sum = 0;
        data.items[type].forEach(function (currItem) {
            sum += round(currItem.value, 2);
        });
        data.totals[type] = round(sum, 2);
    };

    let data = {
        items: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };



    return {
        addItem: function (type, description, value) {
            let item, ID;

            if (data.items[type].length > 0) {
                ID = data.items[type][data.items[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'inc') {
                item = new Income(ID, description, value);
            } else {
                item = new Expense(ID, description, value);
            }

            data.items[type].push(item);

            return item;
        },

        removeItem: function (type, ID) {
            let itemToRemove = data.items[type].find(function (item) {
                return item.id == ID;
            });

            data.items[type].splice(data.items[type].indexOf(itemToRemove), 1);
        },

        calculateBudget: function () {
            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = 0;
            }
        },

        calculatePercentages: function () {
            data.items.exp.forEach(function (exp) {
                exp.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            let allPercentages = data.items.exp.map(function (exp) {
                return exp.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function () {
            return {
                totalBudget: data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp
            }
        }
    }
})();

// UI CONTROLLER
let UIController = (function () {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetIncomeValue: '.budget__income--value',
        budgetExpensesValue: '.budget__expenses--value',
        budgetValue: '.budget__value',
        expensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        monthPlaceHolder: '.budget__title--month',
        incControl: '.control_inc',
        expControl: '.control_exp'
    };

    let formatNumber = function (number, type) {
        let numberSplit;

        number = Math.abs(number);
        number = number.toFixed(2);
        numberSplit = number.split('.');

        int = numberSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numberSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    let sortItems = function (items) {
        for (let i = 0; i < items.length - 1; i++) {
            console.log(items[i + 1]);
            if (items[i].children[1].textContent > items[i + 1].children[1].textContent) {
                let tempChild = items[i + 1];
                items[i + 1] = items[i];
                items[i] = tempChild;
            }
        }

        return items;
    };

    return {
        getInput: function () {
            let type = document.querySelector(DOMStrings.inputType).checked ? 'exp' : 'inc';

            return {
                type: type,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            let itemHtml, modifiedItemHtml, element;

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                itemHtml = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMStrings.expensesContainer;
                itemHtml = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            modifiedItemHtml = itemHtml.replace('%id%', obj.id);
            modifiedItemHtml = modifiedItemHtml.replace('%description%', obj.description);
            modifiedItemHtml = modifiedItemHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('afterbegin', modifiedItemHtml);
        },

        removeListItem: function (itemID) {
            let item = document.getElementById(itemID);
            item.parentNode.removeChild(item);
        },

        displayBudget: function (budget) {
            let type;

            budget.totalBudget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetIncomeValue).textContent = formatNumber(budget.totalIncome, 'inc');
            document.querySelector(DOMStrings.budgetExpensesValue).textContent = formatNumber(budget.totalExpenses, 'exp');
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(budget.totalBudget, type);

            if (budget.percentage > 0) {
                document.querySelector(DOMStrings.expensesPercentage).textContent = budget.percentage + '%';
            } else {
                document.querySelector(DOMStrings.expensesPercentage).textContent = '---';
            }
        },

        clearInputFields: function () {
            let inputFields;

            inputFields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            let inputFieldArray = Array.prototype.slice.call(inputFields);
            inputFieldArray.forEach(function (current, index, array) {
                current.value = '';
            });

            inputFieldArray[0].focus();
        },

        displayPercentages: function (percentages) {
            let items = document.querySelectorAll(DOMStrings.itemPercentage);
            percentages = percentages.reverse();

            nodeListForEach(items, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            let now, year, mont, months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.monthPlaceHolder).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            let inputFields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(inputFields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        sortIncomeItems: function () {
            document.querySelector(DOMStrings.incControl).firstChild.firstChild.classList.toggle('ion-android-arrow-dropup');
            document.querySelector(DOMStrings.incControl).firstChild.firstChild.classList.toggle('ion-android-arrow-dropdown');

            let parent = document.querySelector(DOMStrings.incomeContainer);
            parent.append(...Array.from(parent.childNodes).reverse());
        },

        sortExpenseItems: function () {
            document.querySelector(DOMStrings.expControl).firstChild.firstChild.classList.toggle('ion-android-arrow-dropup');
            document.querySelector(DOMStrings.expControl).firstChild.firstChild.classList.toggle('ion-android-arrow-dropdown');

            let parent = document.querySelector(DOMStrings.expensesContainer);
            parent.append(...Array.from(parent.childNodes).reverse());
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();

// GLOBAL APP CONTROLLER
let controller = (function (budgetController, UIController) {

    let id = 0;

    let setupEventListeners = function () {
        let DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);

        document.querySelector(DOM.incControl).addEventListener('click', UIController.sortIncomeItems);
        document.querySelector(DOM.expControl).addEventListener('click', UIController.sortExpenseItems);
    };

    let validateInput = function (input) {
        if ((input.description.length < 1) || isNaN(input.value)) {
            return false;
        }
        return true;
    };

    let updateBudget = function () {
        // 4. Calculate the budget
        budgetController.calculateBudget();

        let budget = budgetController.getBudget();

        // 5. Display the budget on the UI
        UIController.displayBudget(budget);
    };

    let updatePercentages = function () {
        // 1. Calculate percentages
        budgetController.calculatePercentages();
        // 2. Read percentages from budget controller
        let percentages = budgetController.getPercentages();
        // 3. Update UI with new percentages
        UIController.displayPercentages(percentages);
    };

    let sortItems = function () {
        UIController.sortListItems();
    }


    let ctrlAddItem = function () {

        let input, item, budget, inputValid;

        // 1. get field input data
        input = UIController.getInput();

        if (validateInput(input)) {
            // 2. add the item to the budget controller
            item = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIController.addListItem(item, input.type);
            UIController.clearInputFields();

            updateBudget();

            updatePercentages();
        }
    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            budgetController.removeItem(type, ID);
            console.log(itemID);
            UIController.removeListItem(itemID);

            updateBudget();

            updatePercentages();
        }

    };

    return {
        init: function () {
            console.log('Application is started');
            UIController.displayBudget({
                totalBudget: 0,
                percentage: 0,
                totalIncome: 0,
                totalExpenses: 0
            });
            setupEventListeners();
            UIController.displayMonth();
        }
    }



})(budgetController, UIController);

controller.init();