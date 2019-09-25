

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




console.log("OK");

var db = firebase.firestore();
var colRef = db.collection("samples");
var docRef = db.doc("samples/sandwichData");

const messaging = firebase.messaging();
let uniqueFlag = false;


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(registration => {
        console.log(registration);
        console.log("aaaa");
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
messaging.onMessage(payload => {
    console.log(payload);
});

// ボタン押下のタイミングでユーザに通知権限を求めてOKなら既に保存されているFCMトークンと照合、
//　新規のトークンなら保存
function requestPermission() {
    messaging.requestPermission().then(() => {
        messaging.getToken().then(token => {
            alert(token);
            colRef.get().then(function (col) {
                console.log("OK");
                console.log(col.docs);
                for (let i = 0; i < col.docs.length; i++) {
                    let docData = col.docs[i]._document.proto.fields.fcmToken.stringValue;
                    console.log("document---" + docData);
                    console.log("token---" + token);
                    if (token != docData) {
                        uniqueFlag = false;
                        console.log(uniqueFlag);
                    } else {
                        uniqueFlag = true;
                        console.log(uniqueFlag);
                    }

                }
                // console.log(document);
                if (uniqueFlag === false) {
                    colRef.add({
                        fcmToken: token
                    }).then(function () {
                        console.log("Status saved");
                    }).catch(function (error) {
                        console.log("Got an error:", error);
                    })
                } else {
                    console.log("既にフラッグがあります。")
                }

            }).catch(function (error) {
                console.log("Got an error:", error);
            });
            console.log(token);

        }).catch(error => {
            console.error(error);
        });
    }).catch(error => {
        console.error(error)
    });
}

const outputHeader = document.querySelector("#hotDogOutput");
const inputTextField = document.querySelector("#latestHotDogStatus");
const pushButton = document.querySelector("#loadButton");


//firestoreからfcmトークンを全件取得し、各トークンの値をfetchでhttps://fcm.googleapis.com/fcm/sendに送信
pushButton.addEventListener("click", function () {
    colRef.get().then(function (col) {
        for (let i = 0; i < col.docs.length; i++) {
            let docData = col.docs[i]._document.proto.fields.fcmToken.stringValue;
            console.log("fcmToken---" + docData);
            fetch("https://fcm.googleapis.com/fcm/send", {
                method: "POST",
                headers: {
                    "Authorization": "key=AAAA9Mj0PLs:APA91bEBbRuMaytQPW-W3rb3TrgxZTCz07xdwHEGcJrewKxtANCtO3cg4_KET-dYs9-s9FBIM-dKzx0fU8e5GKtY78eE4v0Kxc63PgH_SscHpiXpvbAz9DXbJq-KHbW0MXfZ8sXEn5DU",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: docData,
                    notification: { body: "Hello" },
                    priority: 10
                }),
            }).then(function () {
                console.log("push成功");
            }).catch(function (error) {
                console.log("Got an error:", error);
            })
        }
    });
});