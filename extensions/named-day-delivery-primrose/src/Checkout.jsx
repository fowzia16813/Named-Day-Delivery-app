import {
  DatePicker,
  Heading,
  reactExtension,
  useApi,
  useApplyMetafieldsChange,
  useCartLines,
  useDeliveryGroupListTarget,
  useShippingAddress
} from "@shopify/ui-extensions-react/checkout";
import { useCallback, useMemo, useState } from "react";

reactExtension("purchase.checkout.shipping-option-list.render-after", () => (
  <Extension />
));

export default function Extension() {
  const [selectedDate, setSelectedDate] = useState("");
  const [yesterday, setYesterday] = useState("");

  const { extension } = useApi();
  const { target } = extension;
  
  const shippingAddress = useShippingAddress();
  const zipCode = shippingAddress.zip;
  
  const cartLines = useCartLines();
  // console.log("Cartlines===========", cartLines)
  
 

  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

  // Get the delivery group list
  const deliveryGroupList = useDeliveryGroupListTarget();

  // Define the metafield namespace and key
  const metafieldNamespace = "custom";
  const metafieldKey = "delivery_date";

  // Sets the selected date to today, unless today is Sunday, then it sets it to tomorrow
  useMemo(() => {
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const deliveryDate = today.getDay() === 0 ? tomorrow : today;

    setSelectedDate(formatDate(deliveryDate));
    setYesterday(formatDate(yesterday));
  }, []);

  // Set a function to handle the Date Picker component's onChange event
  const handleChangeDate = useCallback((selectedDate) => {
    setSelectedDate(selectedDate);
    // Apply the change to the metafield
    applyMetafieldsChange({
      type: "updateMetafield",
      namespace: metafieldNamespace,
      key: metafieldKey,
      valueType: "string",
      value: selectedDate,
    });
  }, []);

  // Guard against duplicate rendering
  if (!deliveryGroupList || deliveryGroupList.groupType !== 'oneTimePurchase') {
    return null;
  }

  const { deliveryGroups } = deliveryGroupList;

// Function to compute if Express or Shipx Standard Shipping 19.99 is selected in any of the delivery groups
const titleArray =[ "Standard named day delivery"]
console.log("title of the selected ", deliveryGroups)
const isExpressSelected = () => {
  const expressHandles = new Set(
      deliveryGroups
        .flatMap(({ deliveryOptions }) =>
          deliveryOptions
            .filter(({ title }) =>
              titleArray.includes(title)
            )
            .map(({ handle }) => handle)
        )
    );
   return deliveryGroups.some(({ selectedDeliveryOption }) =>
      expressHandles.has(selectedDeliveryOption?.handle)
   );
};

// const postCodeArray = [ "AB30", "KA27", "PO30", "PA40", "DN9" ]
// const isPostCodeTrue = () => {
//   for (const prefix of postCodeArray) {
//     if (zipCode.startsWith(prefix)) {
//       return false;
//     }
//   }

//   return true;
// };


// const givenSkuList = cartLines.map(item => item.merchandise.sku);
// console.log(givenSkuList)
// const skuArray=['GU 0030', 'S 1180']
// const set = new Set(skuArray);
// const hasCommonItem = givenSkuList.some(item => set.has(item));




  // Render the extension components 
  // return isExpressSelected() && isPostCodeTrue() && hasCommonItem == false ? (
  return (
    <>
      <Heading>Select a date for delivery</Heading>
      <DatePicker
        selected={selectedDate}
        onChange={handleChangeDate}
        disabled={["Sunday", { end: yesterday }]}
      />
    </>
  ) 
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

