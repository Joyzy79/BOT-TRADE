const WebSocket = require("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

const PROFITABILITY = parseFloat(process.env.PROFITABILITY);
let sellPrice = 0;

ws.onmessage = (event) => {
    console.clear(); // Limpa a tela para mostrar apenas os dados mais recentes
    const obj = JSON.parse(event.data);
    console.log("Symbol:"+ obj.s); // Mensagem recebida do servidor
    console.log("Best Ask:"+ obj.a); // Mensagem recebida do servidor

    const currentPrice = parseFloat(obj.a);
    if (sellPrice === 0 && currentPrice < 63680){
         console.log("Boa hora pra comprar!");
         newOrder("0.001","BUY")
         sellPrice = currentPrice * PROFITABILITY;
    }
    else if(sellPrice !== 0 && currentPrice > sellPrice){
        console.log("Melhor vender agora!");
        newOrder("0.001","SELL")
        sellPrice = 0;
    }
        else
        console.log("Espere...Sell Price:" + sellPrice);
}
    
ws.onerror = (error) => {
    console.error("Erro ao conectar ao WebSocket:", error);
};
ws.onclose = () => {
    console.log("Conexão WebSocket foi fechada.");
};
const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side){
    const data = {
        Symbol: process.env.SYMBOL,
        type: 'MARKET',
        Quantity: quantity,
        Side: side
    }

    const timestamp =  Date.now();
    const recvwindow = 6000; // Time allowed to respond to the request in mill

    const signature = crypto
        .createHmac('sha256',process.env.SECRET_KEY)
        .update(`${new URLSearchParams({...data,timestamp, recvwindow})}`)
        .digest('hex');

    const newData = { ...data ,timestamp, recvwindow, signature };
    const qs = `?${new URLSearchParams(newData)}`;

    try{
        const result = await axios({
        method: 'POST',
        url:`${process.env.API_URL}/v3order${qs}`,
        headers:{'X-MBX-APIKEY': process.env.API_KEY},
    })
    console.log(result.data);
    }
catch(err){
    console.log(err)};
}

