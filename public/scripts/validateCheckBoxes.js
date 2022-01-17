function checkbox() {
    console.log("CLICKED!");
    //get checkboxes
    const american = document.getElementById("american");
    const japanese = document.getElementById("japanese");
    const chinese = document.getElementById("chinese");
    const greek = document.getElementById("greek");
    const latin = document.getElementById("latin");
    const italian = document.getElementById("italian");
    const healthy = document.getElementById("healthy");
    const indian = document.getElementById("indian");
    const checkedValues = document.getElementById("checkedBoxes");
    //fill checkedValues with value of checked checkboxes
    if(american.checked){
        checkedValues.value += "American";
    }
    if(japanese.checked){
        checkedValues.value += " Japanese";
    }
    if(chinese.checked){
        checkedValues.value += " Chinese";
    }
    if(greek.checked){
        checkedValues.value += " Greek";
    }
    if(latin.checked){
        checkedValues.value += " Latin";
    }
    if(italian.checked){
        checkedValues.value += " Italian";
    }
    if(healthy.checked){
        checkedValues.value += " Healthy";
    }
    if(indian.checked){
        checkedValues.value += " Indian";
    }
    console.log(checkedValues.value);       
}