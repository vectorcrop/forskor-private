const addRow = (order) => {
  addRow;

  `<tr role="row" class="odd">
<td class="sorting_1"><font color="black"><b>FOID118</b></font></td>
<td><font color="black"><b> ${order.date.split("|")[1]} | ${
    order.date.split("|")[2]
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

const getStatusColor = (status = "") => {
  switch (status) {
    case "placed":
      return "#3498DB";
    case "confirmed":
      return "#1ABC9C";
    case "cooking":
      return "#F39C12";
    case "packed":
      return "#16A085";
    case "dispatched":
      return "#5D6D7E";
    case "picked":
      return "#28B463";
    case "delivered":
      return "#27AE60";
    case "cancelled":
      return "#E74C3C";
    default:
      return "blue";
  }
};
