import { formatKes } from '../utils/auth'
import { splitEnquiryItems } from '../utils/enquiries'
import './EnquiryItemsList.css'

function ItemRow({ item, showPrices }) {
  return (
    <li className="enquiry-items__row">
      <div>
        <strong>{item.title}</strong>
        {item.itemType === 'service' && item.serviceDescription && (
          <p className="enquiry-items__desc">{item.serviceDescription}</p>
        )}
      </div>
      <span className="enquiry-items__meta">
        {item.itemType === 'service' ? 'Service' : item.category}
        {item.qty > 1 && ` × ${item.qty}`}
        {showPrices && (
          <> · {item.quoteOnly ? 'Quote only' : formatKes(item.unitPrice)}</>
        )}
      </span>
    </li>
  )
}

export default function EnquiryItemsList({ items = [], showPrices = true }) {
  const { services, products } = splitEnquiryItems(items)

  if (!items.length) {
    return <p className="enquiry-items__empty">No items listed.</p>
  }

  return (
    <div className="enquiry-items">
      {services.length > 0 && (
        <div className="enquiry-items__group">
          <h4>Services</h4>
          <ul>
            {services.map((item) => (
              <ItemRow key={item.productId} item={item} showPrices={showPrices} />
            ))}
          </ul>
        </div>
      )}
      {products.length > 0 && (
        <div className="enquiry-items__group">
          <h4>Products</h4>
          <ul>
            {products.map((item) => (
              <ItemRow key={item.productId} item={item} showPrices={showPrices} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
