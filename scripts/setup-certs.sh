#!/usr/bin/env bash
# Generates a locally-trusted HTTPS certificate for phone testing.
#
# Browser geolocation only works in a secure context, so testing on a phone
# over the LAN needs HTTPS. mkcert issues a certificate signed by a CA it
# installs into your system trust store, so you get no certificate warning —
# unlike the self-signed fallback Vite uses when these files are absent.
#
# Usage:  bash scripts/setup-certs.sh [lan-ip]

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cert_dir="$repo_root/certs"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert is not installed."
  echo
  echo "  macOS:  brew install mkcert"
  echo "  Linux:  https://github.com/FiloSottile/mkcert#installation"
  echo
  echo "Then re-run: bash scripts/setup-certs.sh"
  exit 1
fi

# The cert has to name the address your phone will actually connect to.
lan_ip="${1:-}"
if [ -z "$lan_ip" ]; then
  case "$(uname -s)" in
    Darwin)
      for iface in en0 en1 en2; do
        lan_ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
        [ -n "$lan_ip" ] && break
      done
      ;;
    *)
      lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
      ;;
  esac
fi

if [ -z "$lan_ip" ]; then
  echo "Could not detect a LAN IP address — are you connected to Wi-Fi?"
  echo "Pass it explicitly:  bash scripts/setup-certs.sh 192.168.1.42"
  exit 1
fi

echo "Installing the mkcert local CA (may prompt for your password)…"
mkcert -install

mkdir -p "$cert_dir"
mkcert -key-file "$cert_dir/key.pem" -cert-file "$cert_dir/cert.pem" \
  localhost 127.0.0.1 ::1 "$lan_ip"

ca_root="$(mkcert -CAROOT)"

cat <<EOF

Done. Certificates written to certs/ (gitignored, never commit them).

Start the server:  npm run dev:phone
On your phone:     https://$lan_ip:5173/

Your Mac trusts this cert already. To make your PHONE trust it — a one-time
setup that removes the warning for good:

  1. AirDrop or email this file to the phone, then open it:
       $ca_root/rootCA.pem
  2. iOS: Settings → General → VPN & Device Management → install the profile.
  3. iOS: Settings → General → About → Certificate Trust Settings →
     turn ON full trust for the mkcert CA.

If your LAN IP changes (DHCP lease, new network), re-run this script to
reissue the cert. Only step 1-3 above are one-time; the CA stays trusted.
EOF
