// Service Worker Register
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function () {
//         navigator.serviceWorker.register('service-worker.js')
//             .then(registration => {
//                 //console.log('Service Worker is registered', registration);
//             })
//             .catch(err => {
//                 //console.error('Registration failed:', err);
//             });
//     });
// }

$(document).ready(function () {
    $('#dataTable').DataTable({
        "scrollX": true,
        destroy: true,
        lengthMenu: [
            [-1],
            ["All"]
        ],
    });
});
$(document).ready(function () {
    $('#dataTableOrder').DataTable({
        "scrollX": true,
        order: [[0, 'desc']],
        destroy: true,
        lengthMenu: [
            [-1],
            ["All"]
        ],
    });
});


