let currentRid = null;
let currentCid = null;

// Cell blur event listener
for (let i = 0; i < AllGridCells.length; i++) {
    AllGridCells[i].addEventListener("blur", function cellHelper(e) {   
        let content = AllGridCells[i].textContent;
        let address = addressInput.value;
        let { rid, cid } = getRidCidFromAddress(address);

        // Update global variables
        currentRid = rid;
        currentCid = cid;
        
        let cellObject = db[rid][cid];

        if (cellObject.value === content) {
            return;
        }

        if (cellObject.formula) {
            removeFormula(address, cellObject.formula);
            cellObject.formula = "";
            formulaInput.value = "";
        }

        cellObject.value = content;
        setUI(content, rid, cid);
    });
}

// Formula input event listener
formulaInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && formulaInput.value !== "") {
        // Check if currentRid and currentCid are defined
        if (currentRid === null || currentCid === null) {
            console.error("Current cell not defined");
            return;
        }

        let addressOfTheCell = addressInput.value;
        let cFormula = formulaInput.value;
        let cellObject = db[currentRid][currentCid];

        if (cellObject.formula !== cFormula) {
            removeFormula(addressOfTheCell, cellObject.formula);
        }

        let value = evaluateFormula(cFormula);
        setUI(value, currentRid, currentCid);

        cellObject.formula = cFormula;
        cellObject.value = value;
        setFormula(addressOfTheCell, cFormula);
    }
});

function evaluateFormula(formula) {
    // ( A1 + A2 ) ->[] 
    let formulaEntities = formula.split(" ");
    // [(,A1,+,A2,)]
    for (let i = 0; i < formulaEntities.length; i++) {

        let ascii = formulaEntities[i].charCodeAt(0);

        if (ascii >= 65 && ascii <= 90) {
            // address -> rid cId
            let cellrcObj = getRidCidFromAddress(formulaEntities[i]);
            // db -> value
            let value = db[cellrcObj.rid][cellrcObj.cid].value;
            // replace in formula
            formula = formula.replace(formulaEntities[i], value);
        }
    }



    // eval -> evaluate-> inbuilt 
    let result = eval(formula);
    return result;
}

function setFormula(address, formula) {
    // ( A1 + A2 ) -> ( 10 + 20 )
    let formulaEntities = formula.split(" ");
    // [(,A1,+,A2,)]
    for (let i = 0; i < formulaEntities.length; i++) {
        let ascii = formulaEntities[i].charCodeAt(0);
        if (ascii >= 65 && ascii <= 90) {
            // address -> rid cId
            let parentrcObj = getRidCidFromAddress(formulaEntities[i]);
            // db -> value

            let children = db[parentrcObj.rid][parentrcObj.cid].children;
            children.push(address);
        }
    }
}

function removeFormula(address, formula) {
    // ( A1 + A2 ) -> ( 10 + 20 )
    let formulaEntities = formula.split(" ");
    // [(,A1,+,A2,)]
    for (let i = 0; i < formulaEntities.length; i++) {
        let ascii = formulaEntities[i].charCodeAt(0);
        if (ascii >= 65 && ascii <= 90) {
            // address -> rid cId
            let parentrcObj = getRidCidFromAddress(formulaEntities[i]);
            // db -> value
            let children = db[parentrcObj.rid][parentrcObj.cid].children;
            let idx = children.indexOf(address);
            children.splice(idx, 1);
         
        }
    }
}

function setUI(value, rid, cid) {

    let tobeChangedCell = document.querySelector(`.grid .cell[rId='${rid}'][cId='${cid}']`);
    tobeChangedCell.textContent = value;
    db[rid][cid].value = value;
    // change your children -> re-evaulate -> set ui
    let childrenArr = db[rid][cid].children;
    // B1
    for (let i = 0; i < childrenArr.length; i++) {
        let chriciobj = getRidCidFromAddress(childrenArr[i]);
        let chCellObj = db[chriciobj.rid][chriciobj.cid];
        let value = evaluateFormula(chCellObj.formula);
        setUI(value, chriciobj.rid, chriciobj.cid)
    }
}
