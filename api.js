const BASE_URL = 'https://api.melangkah.my.id';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch (e) {  }
  if (!res.ok) throw new Error((json && json.message) || 'Request gagal (HTTP ' + res.status + ')');
  return json;
}

function toList(json) {
  if (Array.isArray(json)) return json;
  if (json) {
    for (const k of ['data', 'records', 'result', 'results']) {
      if (Array.isArray(json[k])) return json[k];
    }
  }
  return [];
}

const rupiah = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function notifError(e) { Swal.fire('Gagal', e.message || 'Terjadi kesalahan', 'error'); }
