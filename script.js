const apiKey = 'TV5NQIQJIC1DJ46B';
const stockSearch = document.getElementById('stockSearch');
const searchButton = document.getElementById('searchButton');
const stockDetails = document.getElementById('stockDetails');
const stockTable = document.getElementById('stockTable').getElementsByTagName('tbody')[0];
const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart;

const stockDropdown = document.getElementById('stockDropdown');
const loadStockButton = document.getElementById('loadStockButton');

async function getStockData(stockSymbol) {
    try {
        console.log(`Fetching data for stock: ${stockSymbol}`);
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${stockSymbol}&apikey=${apiKey}`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error('Invalid stock symbol. Please try again.');
        }
        
        console.log('Stock data fetched:', data);
        return data['Weekly Time Series'];
    } catch (error) {
        console.error('Error fetching stock data:', error);
        stockDetails.innerHTML = `<p>${error.message}</p>`;
        return null;
    }
}

async function getTrendingStocks() {
    const trendingStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'FB', 'NFLX', 'NVDA', 'BABA', 'INTC'];
    return trendingStocks; 
}

async function populateDropdown() {
    const trendingStocks = await getTrendingStocks();
    trendingStocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock;
        option.text = stock;
        stockDropdown.appendChild(option);
    });
}

function displayStockDetails(stockData, symbol) {
    const latestDate = Object.keys(stockData)[0];
    const latestData = stockData[latestDate];
    const price = latestData['4. close'];
    const volume = latestData['5. volume'];
    
    stockDetails.innerHTML = `
        <h3>${symbol}</h3>
        <p>Price: $${price}</p>
        <p>Volume: ${volume}</p>
    `;

    updateStockTable(symbol, price, volume);
}

function updateStockTable(symbol, price, volume) {
    const newRow = stockTable.insertRow();
    newRow.innerHTML = `
        <td>${symbol}</td>
        <td>$${price}</td>
        <td>N/A</td>
        <td>${volume}</td>
    `;
}

function displayStockGraph(stockData) {
    const labels = Object.keys(stockData).slice(0, 10).reverse();
    const data = labels.map(date => stockData[date]['4. close']);

    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Price',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

searchButton.addEventListener('click', async () => {
    const stockSymbol = stockSearch.value.toUpperCase();
    const stockData = await getStockData(stockSymbol);
    
    if (stockData) {
        displayStockDetails(stockData, stockSymbol);
        displayStockGraph(stockData);
    }
});

loadStockButton.addEventListener('click', async () => {
    const selectedStock = stockDropdown.value;
    const stockData = await getStockData(selectedStock);
    if (stockData) {
        displayStockDetails(stockData, selectedStock);
        displayStockGraph(stockData);
    }
});

populateDropdown();
