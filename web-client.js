document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const listToolsButton = document.getElementById('listTools');
    const infoResultDiv = document.getElementById('infoResult');

    const walletAddressInput = document.getElementById('walletAddress');
    const getWalletInfoButton = document.getElementById('getWalletInfo');
    const walletInfoResultDiv = document.getElementById('walletInfoResult');

    // Display error in result div
    function displayError(resultDiv, error) {
        resultDiv.textContent = `Error: ${error.message || error}`;
        resultDiv.style.color = 'red';
    }

    // Reset result div style
    function resetResultDiv(resultDiv) {
        resultDiv.textContent = 'Loading...';
        resultDiv.style.color = 'black';
    }

    // Format token balance
    function formatTokenBalance(balance, decimals) {
        return Number(balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        });
    }

    // Format wallet info
    function formatWalletInfo(data) {
        if (!data.content || !data.content[0] || !data.content[0].text) {
            return 'No wallet information available';
        }

        try {
            const text = data.content[0].text;
            let nativeBNB = '0';
            let tokenBalances = [];

            // Extract native BNB balance
            const bnbMatch = text.match(/Native Balance \(BNB\): ([\d.]+)/);
            if (bnbMatch) {
                nativeBNB = bnbMatch[1];
            }

            // Extract token balances
            const tokenBalancesMatch = text.match(/Token Balances:\s*(\[.*\])/s);
            if (tokenBalancesMatch) {
                try {
                    tokenBalances = JSON.parse(tokenBalancesMatch[1]);
                } catch (e) {
                    console.error('Error parsing token balances:', e);
                }
            }

            let html = `<div class="wallet-info">`;
            
            // Display Native BNB Balance
            html += `<div class="balance-section">`;
            html += `<strong>Native Balance:</strong>`;
            html += `<div class="token-item">`;
            html += `<div class="token-name">`;
            html += `<img src="https://logo.moralis.io/0x38_0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c_015169d2e8f5ef78f93becb82ae0ed8c.png" alt="BNB" class="token-logo">`;
            html += `<span>BNB</span>`;
            html += `</div>`;
            html += `<div class="token-balance">${formatTokenBalance(nativeBNB, 18)}</div>`;
            html += `</div>`;
            html += `</div>`;
            
            // Display Token Balances
            if (tokenBalances.length > 0) {
                html += `<div class="balance-section">`;
                html += `<strong>Token Balances:</strong>`;
                html += `<div class="token-grid">`;
                tokenBalances.forEach(token => {
                    const formattedBalance = formatTokenBalance(token.balance, token.decimals);
                    html += `
                        <div class="token-item">
                            <div class="token-name">
                                ${token.logo ? `<img src="${token.logo}" alt="${token.symbol}" class="token-logo">` : ''}
                                <span>${token.symbol}</span>
                            </div>
                            <div class="token-balance">${formattedBalance}</div>
                            <div class="token-full-name">${token.name}</div>
                        </div>
                    `;
                });
                html += `</div>`;
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        } catch (error) {
            console.error('Error formatting wallet info:', error);
            return 'Error formatting wallet information';
        }
    }

    // List Tools
    listToolsButton.addEventListener('click', async () => {
        resetResultDiv(infoResultDiv);
        try {
            const response = await fetch('/api/tools');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to list tools');
            }
            const data = await response.json();
            
            if (data.tools && Array.isArray(data.tools)) {
                infoResultDiv.innerHTML = '<strong>Available Tools:</strong><br>' + 
                    data.tools.map(tool => `- ${tool.name}`).join('<br>');
            } else {
                infoResultDiv.textContent = "No tools available or invalid response format";
            }
        } catch (error) {
            displayError(infoResultDiv, error);
        }
    });

    // Get Wallet Info
    getWalletInfoButton.addEventListener('click', async () => {
        resetResultDiv(walletInfoResultDiv);
        const address = walletAddressInput.value;

        if (!address || !address.startsWith('0x')) {
            displayError(walletInfoResultDiv, 'Please enter a valid BSC wallet address starting with 0x');
            return;
        }

        try {
            const balanceResponse = await fetch('/api/tool/Get_Wallet_Info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ address })
            });

            if (!balanceResponse.ok) {
                const errorData = await balanceResponse.json();
                throw new Error(errorData.error || 'Failed to get wallet info');
            }

            const data = await balanceResponse.json();
            walletInfoResultDiv.innerHTML = formatWalletInfo(data);
        } catch (error) {
            displayError(walletInfoResultDiv, error);
        }
    });
}); 