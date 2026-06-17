$ErrorActionPreference = "Stop"

Write-Host "== FacturePro Windows setup ==" -ForegroundColor Green

Set-Content -Path .env -Value 'DATABASE_URL="postgresql://facturepro:facturepro_password@localhost:5433/facturepro?schema=public"'
Add-Content -Path .env -Value 'NEXT_PUBLIC_APP_URL="http://localhost:3000"'
Add-Content -Path .env -Value 'OPENAI_API_KEY=""'
Add-Content -Path .env -Value 'OPENAI_MODEL="gpt-5.5-mini"'

(Get-Content docker-compose.yml) -replace '"5432:5432"', '"5433:5432"' | Set-Content docker-compose.yml

Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

docker compose down
docker compose up -d

npm run db:generate
npm run db:push
npm run db:seed

Write-Host "OK. Lance maintenant : npm run dev" -ForegroundColor Green
