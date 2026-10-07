let modalUnit;

document.addEventListener('DOMContentLoaded', () => {
  modalUnit = new bootstrap.Modal(document.getElementById('modalUnit'));
  document.getElementById('btnTambah').addEventListener('click', bukaTambah);
  document.getElementById('btnRefresh').addEventListener('click', loadUnit);
  document.getElementById('formUnit').addEventListener('submit', simpanUnit);
  loadUnit();
});

async function loadUnit() {
  const tbody = document.getElementById('tbodyUnit');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Memuat data...</td></tr>';
  try {
    const list = toList(await api('/unit/read.php'));
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Belum ada data unit</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(u => `
      <tr>
        <td>#${esc(u.id_unit)}</td>
        <td>${esc(u.nama_unit)}</td>
        <td><span class="badge bg-primary">${esc(u.tipe_ps)}</span></td>
        <td>${rupiah(u.harga_per_jam)}</td>
        <td><span class="badge ${u.status === 'Tersedia' ? 'bg-success' : 'bg-warning text-dark'}">${esc(u.status)}</span></td>
        <td>
          <button class="btn btn-sm btn-warning" onclick='bukaEdit(${JSON.stringify(u)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="hapusUnit(${Number(u.id_unit)}, '${esc(u.nama_unit).replace(/'/g, "\\'")}')">Hapus</button>
        </td>
      </tr>`).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data</td></tr>';
    notifError(e);
  }
}

function bukaTambah() {
  document.getElementById('formUnit').reset();
  document.getElementById('idUnit').value = '';
  document.getElementById('judulModal').textContent = 'Tambah Unit PS Baru';
  document.getElementById('btnSimpan').textContent = 'Simpan Unit';
  modalUnit.show();
}

function bukaEdit(u) {
  document.getElementById('idUnit').value = u.id_unit;
  document.getElementById('namaUnit').value = u.nama_unit;
  document.getElementById('tipePs').value = u.tipe_ps;
  document.getElementById('harga').value = u.harga_per_jam;
  document.getElementById('status').value = u.status;
  document.getElementById('judulModal').textContent = 'Edit Unit PS';
  document.getElementById('btnSimpan').textContent = 'Update Unit';
  modalUnit.show();
}

async function simpanUnit(ev) {
  ev.preventDefault();
  const id = document.getElementById('idUnit').value;
  const data = {
    nama_unit: document.getElementById('namaUnit').value.trim(),
    tipe_ps: document.getElementById('tipePs').value,
    harga_per_jam: Number(document.getElementById('harga').value),
    status: document.getElementById('status').value
  };

  try {
    if (id) {
      await api('/unit/update.php', { method: 'PUT', body: { id_unit: Number(id), ...data } });
    } else {
      await api('/unit/create.php', { method: 'POST', body: data });
    }
    modalUnit.hide();
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data unit tersimpan', timer: 1500, showConfirmButton: false });
    loadUnit();
  } catch (e) { notifError(e); }
}

async function hapusUnit(id, nama) {
  const c = await Swal.fire({
    title: 'Hapus Unit?',
    text: `Apakah Anda yakin ingin menghapus '${nama}'? Semua riwayat transaksi unit ini akan terpengaruh!`,
    icon: 'warning', showCancelButton: true,
    confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  });
  
  if (!c.isConfirmed) return;
  try {
    await api('/unit/delete.php', { method: 'DELETE', body: { id_unit: id } });
    Swal.fire({ icon: 'success', title: 'Terhapus', timer: 1200, showConfirmButton: false });
    loadUnit();
  } catch (e) { notifError(e); }
}
