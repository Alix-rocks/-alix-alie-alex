// Import the functions you need from the SDKs you need
  // import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
  // import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, getDoc, query, where, addDoc, deleteDoc, doc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { app, analytics, db, auth, provider } from "./myFirebase.js";
import { choosingLine } from "./metro.js";
choosingLine("DL");
// import transCode from "./transCode.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  // const firebaseConfig = {
  //   apiKey: "AIzaSyBHSLxXWZUAOH8bKsRSGMnSzOh6QnyPTWQ",
  //   authDomain: "alix-alie-alex.firebaseapp.com",
  //   projectId: "alix-alie-alex",
  //   storageBucket: "alix-alie-alex.appspot.com",
  //   messagingSenderId: "519484588635",
  //   appId: "1:519484588635:web:ec162ad407f9b45f60357e",
  //   measurementId: "G-NFDD6B1G9R"
  // };

// Initialize Firebase
  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);
  // const db = getFirestore(app);
  // const auth = getAuth(app);
  // const provider = new GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
auth.languageCode = 'fr';

getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log("alloooo");
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    // console.log(auth.currentUser.displayName);
    
    
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    // const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  // console.log(auth);
  function logIn(){
      signInWithRedirect(auth, provider);
      document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
      document.getElementById("scheduleTime").innerHTML = ``;
  }
  window.logIn = logIn;

  onAuthStateChanged(auth,(user) => {
    if(user){
      console.log(user);
      document.getElementById("displayName").innerText = " " + user.displayName + ",";
      document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
      document.getElementById("scheduleTime").innerHTML = ``;
      getPlans();
    } else{
      document.getElementById("displayName").innerText = "";
      document.getElementById("scheduleTimeWhole").classList.add("popupBackDG");
      document.getElementById("scheduleTime").innerHTML = `<h4><span class="h3like">First thing's first...</span><br/><span class="h1like" style="font-size: calc(19.53px + 0.19vw); font-weight: 900;">Who do you think you are?!</span></h4>
      <div class="stepBox">
        <button class="timeFormButton" onclick="window.logIn()">Log in</button>
      </div>`;
    }
  })

// const querySnapshot = await getDocs(query(collection(db, "person"), where("lastName", "==", "gentile")));
// querySnapshot.forEach((doc) => {
//   console.log(doc.data());
// });



// TimePage

function getMaxPlans() {
  let max = -1;
  myScheduleList.forEach(plan => {
    max = max > plan.ordre ? max : plan.ordre
  });
  return max;
}

async function saveIt() {
  updateSteps();
  let destination = document.getElementById("nameToSave").value;
  const docRef = doc(db, "plan", auth.currentUser.email, "myPlans", destination);
  const docSnap = await getDoc(docRef);
  // We need to look into only the owner's plans!
  if (docSnap.exists()) {
  // if(await getDoc(doc(db, "plan", destination)).exists()){
    document.getElementById("togglePlansWhole").classList.add("displayNone");
    document.getElementById("timeForm").classList.add("displayNone");
    document.getElementById("scheduleTimeWhole").classList.add("popupBackDG");
    document.getElementById("scheduleTime").innerHTML = `
      <h3>That one has a doppelganger, what should we do?!</h3>
      <h4><em>No, we can't keep them both, otherwise that'll create chaos!</em></h4>
      <div class="saveOption">
        <p>Keep the old one, forget the new one.</p>
        <button title="Cancel" id="saveOptCancel" class="timeFormButtonSmall" onclick="saveOptCancel()">Cancel</button>
      </div>
      <div class="saveOption">
        <p>Keep both but let’s rebaptized the new one...</p>
        <button title="Save as" id="saveOptSaveAs" class="timeFormButtonSmall" onclick="saveOptSaveAs()">Save as</button>
      </div>
      <div class="saveOption">
        <p>Out with the old, in with the new!</p>
        <button title="Replace" id="saveOptReplace" class="timeFormButtonSmall" onclick="window.saveOptReplace()">Replace</button>
      </div>`
  } else{
   await setDoc(doc(db, "plan", auth.currentUser.email, "myPlans", destination), {
    ...steps,
    ordre: (getMaxPlans() + 1)
  })  ;
  getPlans();
  document.getElementById("savePlan").innerHTML = `
  <h3 class="savePlanH3">You saved it!</h3>
  <p style="text-align:center;">Now, go see it in your schedules!</p>`;
  document.querySelector("#timePage").addEventListener("click", clickHandlerSaved);
  }
}
window.saveIt = saveIt;
function clickHandlerSaved(){
  document.getElementById("savePlan").innerHTML = ``;
  document.querySelector("#timePage").removeEventListener("click", clickHandlerSaved);
}

async function saveOptReplace(){
  let destination = document.getElementById("nameToSave").value;
  await updateDoc(doc(db, "plan", auth.currentUser.email, "myPlans", destination), {
    ...steps
  });
  document.getElementById("togglePlansWhole").classList.remove("displayNone");
  document.getElementById("timeForm").classList.remove("displayNone");
  document.getElementById("scheduleTimeWhole").classList.remove("popupBackDG");
  document.getElementById("scheduleTime").innerHTML = ``;
  getPlans();
  document.getElementById("savePlan").innerHTML = `
  <h3 class="savePlanH3">You replaced it!</h3>
  <p style="text-align:center;">Now, go see it in your schedules!</p>`;
  document.querySelector("#timePage").addEventListener("click", clickHandlerSaved);
}
window.saveOptReplace = saveOptReplace;

async function getPlans() {
  const getPlans = await getDocs(collection(db, "plan", auth.currentUser.email, "myPlans"));
  // const getPlans = await getDocs(query(collection(db, "plan", auth.currentUser.email), where("owner", "==", auth.currentUser.email)));
  myScheduleList = [];
  getPlans.forEach(doc => {
    const namePlan = doc.id;
    const ordrePlan = doc.data().ordre;
    myScheduleList.push({id:namePlan, ordre:ordrePlan});
  });
  if(localStorage.getItem("steps")) {
    steps = JSON.parse(localStorage.getItem("steps"));
    displaySteps();
    if(myScheduleList.length >= 1){
      displayPlans();
    }
  } else if(myScheduleList.length >= 1){
    displayPlans();
    getDefaultSchedule();
  } else{
    steps = {
          ordre:"",
          destination:"",
          steps:[
            // { name: t("Cooking"), value: 30, checked: true, id: crypto.randomUUID() },
            { name: "Cooking", value: 30, checked: true, id: crypto.randomUUID() },
            { name: "Eating", value: 60, checked: true, id: crypto.randomUUID() },
            { name: "Toilet", value: 15, checked: true, id: crypto.randomUUID() },
            { name: "Shower", value: 15, checked: true, id: crypto.randomUUID() },
            { name: "Prepping", value: 30, checked: true, id: crypto.randomUUID() },
            { name: "Travelling", value: 0, checked: true, id: crypto.randomUUID() }],
          arriveeTime:"",
          notes:""};
    displaySteps();
  }
  
}
// getPlans();

async function getSchedule(id){
  // const schedules = await getDocs(query(collection(db, "plan", auth.currentUser.email, id)));
  // schedules.forEach((schedule) => {
  //   steps = schedule.data();
  //   displaySteps();
  // })
  const schedule = await getDoc(doc(db, "plan", auth.currentUser.email, "myPlans", id));
  steps = schedule.data();
  displaySteps();
}
window.getSchedule = getSchedule;

async function getDefaultSchedule(){
  // const defaultSchedule = await getDocs(query(collection(db, "plan"), where("owner", "==", auth.currentUser.email), where("ordre", "==", 0)));
  // defaultSchedule.forEach((doc) => {
  //   steps = doc.data();
  // })
  const defaultSchedule = await getDocs(query(collection(db, "plan", auth.currentUser.email, "myPlans"), where("ordre", "==", 0)));
  defaultSchedule.forEach((doc) => {
    steps = doc.data();
  })
  displaySteps();
}
// getDefaultSchedule();
window.getDefaultSchedule = getDefaultSchedule;

async function trashSchedules(){
  console.log(trashedSchedules);
  for (const trashedSchedule of trashedSchedules) {
    await deleteDoc(doc(db, "plan", auth.currentUser.email, "myPlans", trashedSchedule.id));
  };
}
window.trashSchedules = trashSchedules;

async function orderSchedules(){
  for (const list of myScheduleList){
    await updateDoc(doc(db, "plan", auth.currentUser.email, "myPlans", list.id), {
      ordre: list.ordre
    });
  }
}
window.orderSchedules = orderSchedules;



// To get today'shit 
async function getTodaysShit() {
  const myTSArray = [];
  const querySnapshotTS = await getDocs(query(collection(db, "shit")));
  querySnapshotTS.forEach(doc => {
    const check = doc.data().quote;
    // console.log("check = " + check);
    myTSArray.push(check);
  });
  return myTSArray;
};



// To get themed shit to feel 
async function getGearData(theme) {
  const myArray = [];
  const querySnapshot = await getDocs(query(collection(db, "shit"), where("theme", "array-contains", theme)));
  querySnapshot.forEach(doc => {
    const check = doc.data().quote;
    // console.log("check = " + check);
    myArray.push(check);
  });
  return myArray;
};

const shitTypeButton = document.getElementsByClassName('shitTypeButton');
// console.log("shitTypeButton : " + shitTypeButton);
for (let i = 0; i < shitTypeButton.length; i++) {
  let theme = shitTypeButton[i].id;
  // console.log(" theme = " + theme);
  shitTypeButton[i].addEventListener('click', (e) => {
    getGearData(theme)
      .then(gearData => {
        let numAS = getRndInteger(0, gearData.length);
        document.getElementById("ySp").innerHTML = gearData[numAS];
        // console.log("gearData = " + gearData);
      })
  })
};

// To get shit recipe 
async function getShitRecipe(theme) {
  const myRecipe = [];
  const querySnapshotR = await getDocs(query(collection(db, "shit"), where("theme", "array-contains-any", theme)));
  querySnapshotR.forEach(doc => {
    const checkR = doc.data().quote;
    // console.log("checkR = " + checkR);
    myRecipe.push(checkR);
  });
  return myRecipe;
};

document.getElementById('recipe').addEventListener('click', (e) => {
  const shitRChoice = document.getElementsByClassName('shitRChoice');
  let theme = []
  for (let i = 0; i < shitRChoice.length; i++) {
    if (shitRChoice[i].checked) {
      theme.push(shitRChoice[i].value);
    }
  }
  console.log("theme = " + theme);
  getShitRecipe(theme)
    .then(thisRecipe => {
      let numAS = getRndInteger(0, thisRecipe.length);
      document.getElementById("yourShit").classList.add("yourShitHover");
      document.getElementById("ySp").innerHTML = thisRecipe[numAS];
      document.getElementById("coverMyShit").style.display = "block";
      if (document.getElementById("switchModeBall").classList.contains("ballDark")) {
        document.getElementById("coverMyShit").style.background = "#000";
      } else {
        document.getElementById("coverMyShit").style.background = "#F2F3F4";
      };
      document.getElementById("enough").style.display = "flex";
      document.getElementById("heresYSR").classList.add("fixYourShit");
      document.getElementById("explainShit").style.display = "block";
      console.log("thisRecipe = " + thisRecipe);
      // then again
      let max = thisRecipe.length;
      let min = 0;
      let arrR = [];
      for (i = 0; i < max; i++) {
        x = Math.floor(Math.random() * max) + min;
        if (arrR.includes(x) == true) {
          i = i - 1;
        } else {
          if (x > max == false) {
            arrR.push(x);
          }
        }
      } console.log("arrR = " + arrR);
      let R = 0;
      console.log("max = " + max);
      const controller = new AbortController();
      document.getElementById('yourShit').addEventListener('click', (e) => {
        let numRS = arrR[R++];
        console.log("numRS = " + numRS);
        if (numRS === undefined) {
          document.getElementById("ySp").innerHTML = "That's it!<br>\nYou ate it all!<br>\nHope you had enough!";
          document.getElementById("explainShit").style.display = "none";
          document.getElementById("yourShit").classList.remove("yourShitHover");
          //remove EventListener! (ça ça marche pas encore)
          // document.getElementById('yourShit').removeEventListener('click', e);
          controller.abort()
        } else {
          document.getElementById("ySp").innerHTML = thisRecipe[numRS];
        }
      }, { signal: controller.signal })
    })
});

document.getElementById('enough').addEventListener('click', (e) => {
  document.getElementById("coverMyShit").style.display = "none";
  document.getElementById("enough").style.display = "none";
  document.getElementById("heresYSR").classList.remove("fixYourShit");
  document.getElementById("ySp").innerHTML = "Wanna try again?";
  document.getElementById("yourShit").classList.remove("yourShitHover");
});

// To add your own shit
const addYOSForm = document.querySelector('#addYOS')
addYOSForm.addEventListener('submit', (e) => {
  e.preventDefault()
  let finalList = []
  var markedCheckbox = document.getElementsByName('theme');
  for (var checkbox of markedCheckbox) {
    if (checkbox.checked) {
      finalList.push(checkbox.value);
    }
  }
  console.log("finalList = " + finalList + " addYOSForm.quote.value = " + addYOSForm.quote.value);
  if (addYOSForm.quote.value === "" || finalList.length === 0) {
    document.querySelector("#badShit").innerHTML = "You forgot something...";
    document.querySelector("#wisely").innerHTML = "Choose wisely...";
  } else {
    let quoteHTML = addYOSForm.quote.value.replace(/\n/g, '<br>');
    console.log("finalList = " + finalList + " addYOSForm.quote.value = " + addYOSForm.quote.value + "quoteHTML = " + quoteHTML);
    addDoc(collection(db, "shit"), {
      quote: quoteHTML,
      theme: finalList,
      type: "text"
    })
      .then(() => {
        addYOSForm.reset()
        document.querySelector("#wisely").innerHTML = "Choose wisely...";
        document.querySelector("#badShit").innerHTML = "Thank you for your shit!";
      })
  }
});


// window.onload = MyNewRand;
// window.onload = (event) => {
// };  
let arrTS = MyNewRand();
// console.log("arrTS =" + arrTS);    
let TS = 0;
document.getElementById("SotD").addEventListener('click', (e) => {
  getTodaysShit()
    .then(todaysShit => {
      let numBC = getRndInteger(0, BgColor.length);
      let numTC = getRndInteger(0, TextColor.length);
      let numTF = getRndInteger(0, TextFont.length);
      document.getElementById("SotDp").style.fontFamily = TextFont[numTF];
      let numTS = arrTS[TS++];
      console.log("TS= " + TS + "  numTS= " + numTS);
      if (TS < 11) {
        document.getElementById("SotDp").innerHTML = todaysShit[numTS];
      } else if (TS >= 15) {
        document.getElementById("SotDp").innerHTML = "For real,<br>\nit's over now.<br>\nGO get a life!";
        document.getElementById("SotDp").style.fontFamily = "'Fuzzy Bubbles', cursive";
      } else if (TS >= 11) {
        document.getElementById("SotDp").innerHTML = "Now, you've seen enough,<br>\ngo do stuff and come back later.";
        document.getElementById("SotDp").style.fontFamily = "'Chakra Petch', sans-serif";
      }
    })
})
function MyNewRand() {
  let max = 10;
  let min = 0;
  let arrTS = [];
  for (let i = 0; i < max; i++) {
    let x = Math.floor(Math.random() * max) + min;
    if (arrTS.includes(x) == true) {
      i = i - 1;
    } else {
      if (x > max == false) {
        arrTS.push(x);
      }
    }
  }
  return arrTS;
}

// WROTE love

const coteForm = document.querySelector('#coteForm');
coteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let timeNow = Timestamp.fromDate(new Date());
  console.log(timeNow);
  let coteText = document.querySelector('input[name=menuText]:checked').value;
  if(cote > 0){
    let comment = coteForm.comment.value.replace(/\n/g, '<br>');
    addDoc(collection(db, "love"), {
      text: coteText,
      love: cote,
      comment: comment,
      time: timeNow
    })
      .then(() => {
        coteForm.reset();
        coteFormReset();
        document.querySelector("#coteThanks").innerHTML = "Good dog!";
      })
  }
});
window.coteFormReset = coteFormReset;