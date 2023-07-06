const addRow = (order) => {
  addRow;

  `<tr role="row" class="odd">
<td class="sorting_1"><font color="black"><b>FOID118</b></font></td>
<td><font color="black"><b> ${order.date.split('|')[1]} | ${
    order.date.split('|')[2]
  }</b></font> </td>
<td><font color="black"><b>${order.deliveryDetails.name}</b></font>
</td>
<td><font color="black"><b>${order.deliveryDetails.phone}</b></font>
</td>
<td><font color="black"><b>${order.deliveryDetails.address}</b></font>
</td>
<td><font color="black"><b>${order.deliveryDetails.pincode}</b></font></td>

<td><font color="black"><b>${order.deliveryDetails.type}</b></font></td>

  <td><font color="black"><b>delivery</b></font>
</td>


<td class="text-uppercase"><font color="${getStatusColor(order.status)}"><b>${
    order.status
  }</b></font>
</td>


<td><a href="/bigwig/view-ordered-products/${
    order._id
  }" class="btn btn-info btn-sm" type="button">Items</a></td>

<td>
    <div>
        <a id="success" class="btn btn-success" href="/bigwig/change-status/?status=confirmed&amp;orderId=${
          order._id
        }&amp;origin=placed-orders">Confirm</a>

        <a href="/bigwig/change-status/?status=cancelled&amp;orderId=${
          order._id
        }&amp;origin=placed-orders" onclick="return confirm('Are You Sure to Cancel This Order ?')" class="btn btn-danger">Cancel</a>
    </div>
</td>
</tr>`;
};

const getStatusColor = (status = '') => {
  switch (status) {
    case 'placed':
      return '#3498DB';
    case 'confirmed':
      return '#1ABC9C';
    case 'cooking':
      return '#F39C12';
    case 'packed':
      return '#16A085';
    case 'dispatched':
      return '#5D6D7E';
    case 'picked':
      return '#28B463';
    case 'delivered':
      return '#27AE60';
    case 'cancelled':
      return '#E74C3C';
    default:
      return 'blue';
  }
};

function showAudioNotification() {
  // Create the notification container
  var notification = document.createElement('div');
  notification.className =
    'toast toast-autohide custom-toast-1 toast-success home-page-toast';
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'assertive');
  notification.setAttribute('aria-atomic', 'true');
  notification.setAttribute('data-bs-delay', '3000');
  notification.setAttribute('data-bs-autohide', 'true');

  // Create the notification body
  var toastBody = document.createElement('div');
  toastBody.className = 'toast-body';

  // Add the success icon
  var successIcon = document.createElement('svg');
  successIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  successIcon.setAttribute('width', '30');
  successIcon.setAttribute('height', '30');
  successIcon.setAttribute('fill', 'currentColor');
  successIcon.setAttribute('class', 'bi bi-check2-circle');
  successIcon.setAttribute('viewBox', '0 0 16 16');

  var successPath1 = document.createElement('path');
  successPath1.setAttribute(
    'd',
    'M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z'
  );

  var successPath2 = document.createElement('path');
  successPath2.setAttribute(
    'd',
    'M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z'
  );

  successIcon.appendChild(successPath1);
  successIcon.appendChild(successPath2);

  // Add the text content
  var toastText = document.createElement('div');
  toastText.className = 'toast-text ms-3 me-2';

  var message = document.createElement('p');
  message.className = 'mb-1 text-white';
  message.textContent = 'New Order Arrived';

  var closeButton = document.createElement('button');
  closeButton.className =
    'btn btn-close btn-close-white position-relative p-1 ms-auto';
  closeButton.setAttribute('type', 'button');
  closeButton.setAttribute('data-bs-dismiss', 'toast');
  closeButton.setAttribute('aria-label', 'Close');

  toastText.appendChild(message);

  toastBody.appendChild(successIcon);
  toastBody.appendChild(toastText);
  toastBody.appendChild(closeButton);

  notification.appendChild(toastBody);

  // Add the notification to the document body
  document.body.appendChild(notification);

  // Create an audio element and play the notification sound
  var audio = new Audio('audio/NewOrderNotification1.mp3');
  audio.play();

  // Remove the notification after 3 seconds
  setTimeout(function () {
    notification.remove();
  }, 3000);
}
