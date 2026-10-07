let modalSewa;
let daftarUnit = [];

document.addEventListener('DOMContentLoaded', () => {
  modalSewa = new bootstrap.Modal(document.getElementById('modalSewa'));
  document.getElementById('btnSewa').addEventListener('click', bukaSewa);
  document.getElementById('btnRefresh').addEventListener('click', loadTransaksi);
  document.getElementById('formSewa').addEventListener('submit', simpanSewa);
  document.getElementById('pilihUnit').addEventListener('change', hitungEstimasi);
  document.getElementById('durasi').addEventListener('input', hitungEstimasi);
  loadTransaksi();
});

async function loadTransaksi() {
  const tbody = document.getElementById('tbodyTransaksi');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Memuat data...</td></tr>';
  try {
    const list = toList(await api('/transaksi_sewa/read.php'));
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Belum ada transaksi</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(t => `
      <tr>
        <td>#TX-${esc(t.id_transaksi)}</td>
        <td>${esc(t.nama_penyewa)}</td>
        <td>${esc(t.nama_unit)}</td>
        <td><span class="badge bg-primary">${esc(t.tipe_ps)}</span></td>
        <td>${esc(t.durasi_jam)} Jam</td>
        <td>${rupiah(t.total_harga ?? t.total_bayar)}</td>
        <td>${esc(t.waktu_sewa ?? t.created_at ?? t.tanggal ?? '-')}</td>
      </tr>`).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Gagal memuat data</td></tr>';
    notifError(e);
  }
}

async function bukaSewa() {
  document.getElementById('formSewa').reset();
  hitungEstimasi();
  const sel = document.getElementById('pilihUnit');
  sel.innerHTML = '<option value="">-- Pilih Unit PS --</option>';
  try {
    daftarUnit = toList(await api('/unit/read.php'));
    daftarUnit.filter(u => u.status === 'Tersedia').forEach(u => {
      sel.insertAdjacentHTML('beforeend',
        `<option value="${esc(u.id_unit)}">${esc(u.nama_unit)} (${esc(u.tipe_ps)}) - ${rupiah(u.harga_per_jam)}/jam</option>`);
    });
    modalSewa.show();
  } catch (e) { notifError(e); }
}

function hitungEstimasi() {
  const u = daftarUnit.find(x => String(x.id_unit) === document.getElementById('pilihUnit').value);
  const jam = Number(document.getElementById('durasi').value) || 0;
  document.getElementById('estimasi').textContent = rupiah(u ? u.harga_per_jam * jam : 0);
}

async function simpanSewa(ev) {
  ev.preventDefault();
  const data = {
    id_unit: Number(document.getElementById('pilihUnit').value),
    nama_penyewa: document.getElementById('namaPenyewa').value.trim(),
    durasi_jam: Number(document.getElementById('durasi').value)
  };
  try {
    await api('/transaksi_sewa/create.php', { method: 'POST', body: data });
    modalSewa.hide();
    Swal.fire({ icon: 'success', title: 'Transaksi dibuat', timer: 1500, showConfirmButton: false });
    loadTransaksi();
  } catch (e) { notifError(e); }
}
