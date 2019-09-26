

var firebaseConfig = {
    apiKey: "AIzaSyBgf5gjrSqbwSET_Dc57fb6KMJ2YnGWKbM",
    authDomain: "harada-fire-store-test.firebaseapp.com",
    databaseURL: "https://harada-fire-store-test.firebaseio.com",
    projectId: "harada-fire-store-test",
    storageBucket: "harada-fire-store-test.appspot.com",
    messagingSenderId: "1051343469755",
    appId: "1:1051343469755:web:e2dc47c26d8ea1f2b7bd9e"
};

firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();
const colRef = db.collection("samples");
const docRef = db.doc("samples/sandwichData");

const messaging = firebase.messaging();
let uniqueFlag = false;
let flagAllay = [];


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(registration => {
        console.log(registration);
        console.log("aaa");
        messaging.useServiceWorker(registration);
    }).catch(error => {
        console.error(error);
    });
}

window.addEventListener('online', e => {
    console.log('online');
}, false);

window.addEventListener('offline', e => {
    console.log('offline');
}, false);

// アプリがフォアグラウンドにある場合にプッシュ通知が届いた場合にログ出力
// https://firebase.google.com/docs/cloud-messaging/js/receive?hl=ja
messaging.onMessage(function(payload) {
    console.log("ちーむらぼうえい");
    console.log(payload);
});

// ボタン押下のタイミングでユーザに通知権限を求めてOKなら既に保存されているFCMトークンと照合、
//　新規のトークンなら保存
function requestPermission() {
    messaging.requestPermission().then(() => {
        messaging.getToken().then(token => {
            colRef.get().then(function (col) {    
                checkDuplicatedToken(col, token)  
            }).catch(function (error) {
                console.log("Got an error:", error);
            });
        }).catch(error => {
            console.error(error);
        });
    }).catch(error => {
        console.error(error)
    });
}

function trueOrFalse(element) {
    return element === true;
}

function checkDuplicatedToken(col, token) {
    for (let i = 0; i < col.docs.length; i++) {
        let docData = col.docs[i]._document.proto.fields.fcmToken.stringValue;
        if (token != docData) {
            flagAllay.push(false);
            console.log(flagAllay);
        } else {
            flagAllay.push(true);
            console.log(flagAllay);
        }
    }
    if (flagAllay.some(trueOrFalse)) {
        console.log("既に重複するfcmTokenがあります。")
        flagAllay.length = 0;
    } else {
        addToken(token);
        flagAllay.length = 0;
    }
}

function addToken(token) {
    colRef.add({
        fcmToken: token
    }).then(function () {
        console.log("Status saved");
    }).catch(function (error) {
        console.log("Got an error:", error);
    })
}

const outputHeader = document.querySelector("#hotDogOutput");
const inputMessageField = document.querySelector("#fcmMessageField");
const inputLinkField = document.querySelector("#fcmLinkField");
const pushButton = document.querySelector("#pushButton");


//firestoreからfcmトークンを全件取得し、各トークンの値をfetchでhttps://fcm.googleapis.com/fcm/sendに送信
pushButton.addEventListener("click", function () {
    const fcmMessage = inputMessageField.value;
    const fcmLink = inputLinkField.value;
    colRef.get().then(function (col) {
        for (let i = 0; i < col.docs.length; i++) {
            let docData = col.docs[i]._document.proto.fields.fcmToken.stringValue;
            pushNotification(docData, fcmMessage, fcmLink);
        }
    });
});

function pushNotification(docData, fcmMessage, fcmLink) {
    console.log("fcmToken---" + docData);
        fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
                "Authorization": "key=AAAA9Mj0PLs:APA91bEBbRuMaytQPW-W3rb3TrgxZTCz07xdwHEGcJrewKxtANCtO3cg4_KET-dYs9-s9FBIM-dKzx0fU8e5GKtY78eE4v0Kxc63PgH_SscHpiXpvbAz9DXbJq-KHbW0MXfZ8sXEn5DU",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to: docData,
                notification: { 
                    body: fcmMessage,
                    click_action: fcmLink,
                 },
                priority: 10,
                
            }),
        }).then(function () {
            console.log("push成功");
        }).catch(function (error) {
            console.log("Got an error:", error);
        })
}