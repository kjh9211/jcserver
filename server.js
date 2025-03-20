const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');

const errormessage_id_passworderror = "아이디 또는 비밀번호가 잘못되었습니다."
const errormessage_tokenerror = "로그인을 실패했습니다. 다시 시도해주세요.\n 이 메세지가 계속 발생하는 경우, 관리자에게 문의해 주세요.(error:tokenerror)";
const errormessage_nodata = "대쉬보드로 진입중 정보가 올바르게 입력하지 못했습니다. \n 관리자에게 아이디와 함께 문의해주세요.(error:nodata)";

// DB 사용용 코드
const fs = require("fs");

async function readlogindata(id, password) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    try {
        const password_saved = JSON.parse(await fs.readFileSync(`./DB/LOGIN/${id}.json`));
    } catch (error) {
        await fs.writeFileSync(`./DB/ERROR/READ/${id}.txt`, error.message);
        console.log(`error | x | read | ${id} | ${hash} `);
        return false;
    }
}
async function savelogindata(id,password) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    try{
        await fs.writeFileSync(`./DB/LOGIN/${id}.json`,`{"password":"${hash}"}`);
        return true;
    }catch(error) {
        await fs.writeFileSync(`./DB/ERROR/SAVE/${id}.txt`,error);
        console.log(`error | x | save | ${id} | ${hash} `);
        return error;
    };
};

async function readlogintoken(id,password) {
    const hash = crypto.createHash('sha256').update(`${id}${password}`).digest('hex');
    try{
        const password_saved = await JSON.parse(fs.readFile(`./DB/LOGIN/TOKEN/${id}.json`))
        if (hash == password_saved["token"]) return true; else return false;
    }catch(error) {
        await fs.writeFileSync(`./DB/ERROR/READ/TOKEN/${id}.txt`,error);
        console.log(`error | o | read | ${id} | ${hash} `);
        return false;
    };
};

async function savelogintoken(id,password) {
    const hash = crypto.createHash('sha256').update(`${id}${password}`).digest('hex');
    try{
        await fs.writeFileSync(`./DB/LOGIN/TOKEN/${id}.json`,`{"token":"${hash}"}`);
        return hash;
    }catch(error) {
        await fs.writeFileSync(`./DB/ERROR/SAVE/TOKEN/${id}.txt`,error);
        console.log(`error | o | save | ${id} | ${hash} `);
        return false;
    };
};
// DB 사용용 코드 끝
const app = express();
const port = 3000;

// // HTTP 서버 생성
// const server = http.createServer(app);
// 
// // 웹소켓 서버 생성
// const wss = new WebSocket.Server({ server });
// 
// // 웹소켓 연결 처리
// wss.on('connection', (ws) => {
//   console.log('클라이언트가 연결되었습니다.');
// 
//   // 클라이언트로부터 메시지를 수신했을 때 처리
//   ws.on('message', (message) => {
//     console.log(`수신한 메시지: ${message}`);
//     
//     ws.send(`서버에서 보낸 메시지: ${message}`);
//   });
// 
//   // 클라이언트 연결 종료 처리
//   ws.on('close', () => {
//     console.log('클라이언트가 연결을 종료했습니다.');
//   });
// });

// 기본 라우트
app.get('/', (req, res) => {
    res.redirect("/main");
});

app.get('/main', (req, res) => {
    res.sendFile(__dirname + '/pages/main.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/pages/login.html");
});

app.get("/signup", async (req, res) => {
    res.sendFile(__dirname + "/pages/signup.html");
});

app.get('/loginre', async (req, res) => {
    try{
    const id = req.query.id;
    const password = req.query.password;

    const login = await readlogindata(id,password);
    if (login){
        const token = await savelogintoken(id,password);

        res.redirect(`/dashborad?token=${token}&id=${id}&password=${password}`);
    }
    else{
        res.json({ success: loginSuccessful });
    }}catch(error){
        res.send(errormessage_tokenerror);
    }
});

app.get('/dashborad', async (req, res)=> {
    const token = req.query.token;
    const id = req.query.id;
    const password = req.query.password;
    if (!token||!id||!password){return res.send(errormessage_nodata);}

    const checktoken = await readlogintoken(id,password);
    if (checktoken !== token) res.redirect("/main"); return;
    res.sendFile("./pages/dashborad.html");

});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  console.log(`error | t | mode |      id      |           hash`);
});

