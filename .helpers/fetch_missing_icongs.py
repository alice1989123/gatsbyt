import requests

# Final CoinGecko URLs for missing icons
missing_icons = {
    "shib": "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
    "hbar": "https://assets.coingecko.com/coins/images/3688/small/hbar.png",
    "ton":  "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
    "sui":  "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png"
}


headers = {
    "User-Agent": "Mozilla/5.0"
}

for symbol, url in missing_icons.items():
    print(f"⬇️  Downloading {symbol}.png from CoinGecko...")
    try:
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            with open(f"./public/icons/{symbol}.png", "wb") as f:
                f.write(resp.content)
            print(f"✅ Saved: ./public/icons/{symbol}.png")
        else:
            print(f"❌ Failed to fetch {symbol}.png (status {resp.status_code})")
    except Exception as e:
        print(f"❌ Exception while fetching {symbol}: {e}")
