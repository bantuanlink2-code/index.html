export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return response.status(500).json({ error: 'Telegram belum dikonfigurasi di server.' })
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
    const requiredFields = ['productName', 'productPrice', 'fullName', 'phone', 'email', 'address']
    if (!body || requiredFields.some((field) => typeof body[field] !== 'string' || !body[field].trim())) {
      return response.status(400).json({ error: 'Data pesanan belum lengkap.' })
    }

    const message = [
      '<b>Pesanan Baru</b>',
      '',
      `<b>Produk:</b> ${escapeHtml(body.productName)}`,
      `<b>Harga:</b> Rp ${escapeHtml(body.productPrice)}`,
      `<b>COD:</b> ${body.codEnabled ? 'ON' : 'OFF'}`,
      '',
      `<b>Nama:</b> ${escapeHtml(body.fullName)}`,
      `<b>No. HP:</b> ${escapeHtml(body.phone)}`,
      `<b>Email:</b> ${escapeHtml(body.email)}`,
      `<b>Alamat:</b> ${escapeHtml(body.address)}`,
    ].join('\n')

    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' }),
    })

    if (!telegramResponse.ok) {
      return response.status(502).json({ error: 'Pesan Telegram gagal dikirim.' })
    }

    return response.status(200).json({ ok: true })
  } catch {
    return response.status(400).json({ error: 'Permintaan tidak valid.' })
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character])
}
