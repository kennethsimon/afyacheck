import { Order } from "@/types/general";

export const orders: Order[] = [
  {
    _id: "661fdcb8fc78ac3e2ac0e2ed",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
        business: {
          _id: "653a18b5e57bd65af2df164c",
          name: "Newcastle United",
          trade_name: "Chelsea Football Club",
          company_phone_number: "0746569391",
          company_email: "info@inalipa.co.tz",
          company_website: "",
          documents: [
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164d",
              type: "tin",
              identifier: "123456789",
              file: null,
              updated_at: "2023-10-26T07:43:49.297Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164e",
              type: "business_license",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164f",
              type: "vrn",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
          ],
          monthly_purchase: "",
          user: "653a181ee657dc06c7609240",
          createdAt: "2023-10-26T07:43:49.297Z",
          updatedAt: "2023-10-26T07:43:49.297Z",
          __v: 0,
        },
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T17:29:07+03:00",
          deliveryTime: "17:29",
          location: {
            latitude: -6.7467342,
            longitude: 39.2764949,
          },
        },
      },
      address: "26 Sandvik Street, Dar es Salaam, Tanzania",
      instructions: "",
      recipient_name: "test",
      phone: "0716718040",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "Y5PBMMYN",
    dateCreated: "2024-04-17T14:29:08.748Z",
    metadata: {
      dispatchment: {
        status: "dispatched",
        date: "2024-04-17T14:33:33.395Z",
      },
      delivery: {
        status: "complete",
      },
      fulFillment: {
        date: "2024-04-17T14:33:49.791Z",
        status: "fulfilled",
      },
    },
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
  },
  {
    _id: "661fdb97fc78ac3e2ac0e2b1",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
        business: {
          _id: "653a18b5e57bd65af2df164c",
          name: "Newcastle United",
          trade_name: "Chelsea Football Club",
          company_phone_number: "0746569391",
          company_email: "info@inalipa.co.tz",
          company_website: "",
          documents: [
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164d",
              type: "tin",
              identifier: "123456789",
              file: null,
              updated_at: "2023-10-26T07:43:49.297Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164e",
              type: "business_license",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164f",
              type: "vrn",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
          ],
          monthly_purchase: "",
          user: "653a181ee657dc06c7609240",
          createdAt: "2023-10-26T07:43:49.297Z",
          updatedAt: "2023-10-26T07:43:49.297Z",
          __v: 0,
        },
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T17:24:17+03:00",
          deliveryTime: "17:24",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions: ",m,m,.ml",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 12500,
      deliveryTotal: 0,
      total: 12500,
      currency: "TZS",
    },
    charges: {
      vat: 1906.7796600000006,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "EY4CE3QY",
    dateCreated: "2024-04-17T14:24:18.953Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661fcd41fc78ac3e2ac0e287",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
        business: {
          _id: "653a18b5e57bd65af2df164c",
          name: "Newcastle United",
          trade_name: "Chelsea Football Club",
          company_phone_number: "0746569391",
          company_email: "info@inalipa.co.tz",
          company_website: "",
          documents: [
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164d",
              type: "tin",
              identifier: "123456789",
              file: null,
              updated_at: "2023-10-26T07:43:49.297Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164e",
              type: "business_license",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164f",
              type: "vrn",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
          ],
          monthly_purchase: "",
          user: "653a181ee657dc06c7609240",
          createdAt: "2023-10-26T07:43:49.297Z",
          updatedAt: "2023-10-26T07:43:49.297Z",
          __v: 0,
        },
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T16:23:08+03:00",
          deliveryTime: "16:23",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions: "",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "MEJLZVHD",
    dateCreated: "2024-04-17T13:23:09.691Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661fb716fc78ac3e2ac0e25f",
    shippingAddress: {
      corporate: {
        name: "Reuben shop",
        tin: null,
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          location: {
            latitude: -6.7466221,
            longitude: 39.2765776,
          },
          deliveryDate: "04/17/2024",
          deliveryTime: "22:00",
          deliveryDatetime: "2024-04-17T22:00:00+03:00",
          windowId: "615aee48995dd07fa8cd5fde",
        },
      },
      address: ",773G+9JW, Dar es Salaam, Tanzania",
      phone: "255716718040",
      recipient_name: "Reuben Wedson",
      instructions: " ",
    },
    platform: {
      name: "android",
      device_token:
        "d7cgW2yaSVWNQKnmyTq-N1:APA91bEf-jhU3k21qKoor_oQyf7GbNoujHVSdDzL2pfAoK3Z_PVhBvF98T52Apk_nPJwmjMiyThhRGDwUHQg7bqMK5KNxXHOg1DYt1seD26oMxYTj8EoN5ZntJqMA6NfhC35udRSkGsQ",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "255716718040",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 99500,
      deliveryTotal: 0,
      total: 99500,
      currency: "TZS",
    },
    charges: {
      vat: 15177.966100000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2b",
    serviceId: "jumla",
    trackingNumber: "UUB7RX6V",
    dateCreated: "2024-04-17T11:44:41.254Z",
    metadata: {
      dispatchment: {
        status: "dispatched",
        date: "2024-04-18T13:10:25.397Z",
      },
      delivery: {
        status: "complete",
      },
      fulFillment: {
        date: "2024-04-18T13:11:47.765Z",
        status: "fulfilled",
      },
    },
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
  },
  {
    _id: "661fb1b1fc78ac3e2ac0e231",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
        business: {
          _id: "653a18b5e57bd65af2df164c",
          name: "Newcastle United",
          trade_name: "Chelsea Football Club",
          company_phone_number: "0746569391",
          company_email: "info@inalipa.co.tz",
          company_website: "",
          documents: [
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164d",
              type: "tin",
              identifier: "123456789",
              file: null,
              updated_at: "2023-10-26T07:43:49.297Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164e",
              type: "business_license",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
            {
              verified: false,
              _id: "653a18b5e57bd65af2df164f",
              type: "vrn",
              identifier: "",
              file: null,
              updated_at: "2023-10-26T07:43:49.298Z",
            },
          ],
          monthly_purchase: "",
          user: "653a181ee657dc06c7609240",
          createdAt: "2023-10-26T07:43:49.297Z",
          updatedAt: "2023-10-26T07:43:49.297Z",
          __v: 0,
        },
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T14:25:33+03:00",
          deliveryTime: "14:25",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions: "",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "STD771E9",
    dateCreated: "2024-04-17T11:25:34.481Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661faf41da115d0e3c02f915",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T14:15:09+03:00",
          deliveryTime: "14:15",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions: "",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "C8V98USW",
    dateCreated: "2024-04-17T11:15:10.853Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661faa1fda115d0e3c02f8ed",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T13:53:14+03:00",
          deliveryTime: "13:53",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions:
        "youll find darwin nunez delivery man outside , but youll probably miss him",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "74TSGAPQ",
    dateCreated: "2024-04-17T10:53:15.929Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661f99b6da115d0e3c02f8c5",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T12:43:13+03:00",
          deliveryTime: "12:43",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions: "",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "GTQG1IJI",
    dateCreated: "2024-04-17T09:43:14.665Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661f7d8fda115d0e3c02f89d",
    shippingAddress: {
      corporate: {
        name: "Newcastle United",
        tin: "123456789",
      },
      deliveryMethod: {
        name: "delivery",
        params: {
          deliveryDate: "04/18/2024",
          deliveryDatetime: "2024-04-18T10:43:06+03:00",
          deliveryTime: "10:43",
          location: {
            latitude: -6.8535593,
            longitude: 39.2738143,
          },
        },
      },
      address:
        "Benjamin Mkapa National Stadium, Taifa Road, Dar es Salaam, Tanzania",
      instructions: "testing ",
      recipient_name: "Pochetino",
      phone: "0746569391",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2cb",
    serviceId: "inalipa",
    trackingNumber: "MARJ4SPU",
    dateCreated: "2024-04-17T07:43:07.629Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
  {
    _id: "661f5d60da115d0e3c02f875",
    shippingAddress: {
      deliveryMethod: {
        name: "delivery",
        params: {
          location: {
            latitude: -6.7466327,
            longitude: 39.2765538,
          },
          deliveryDate: "04/17/2024",
          deliveryTime: "09:25",
          deliveryDatetime: "2024-04-17T09:25:40+03:00",
        },
      },
      address: "undefined , 773G+9JW, Dar es Salaam, Tanzania",
      phone: "0718004865",
      recipient_name: "kenneth simon thomas",
      instructions: " ",
    },
    platform: {
      name: "web",
    },
    payment: {
      confirmation: {
        confirmed: false,
        date: null,
      },
      params: {
        phone: "0718004865",
      },
      type: "cash",
      gateway: "cash",
    },
    amount: {
      itemsTotal: 108000,
      deliveryTotal: 0,
      total: 108000,
      currency: "TZS",
    },
    charges: {
      vat: 16474.576270000005,
    },
    partialRefunds: {
      items: [],
      total: 0,
      status: "created",
    },
    createdBy: {
      name: "self",
    },
    status: "complete",
    hasPartialRefund: false,
    partialRefundPending: false,
    channel: "b2c",
    serviceId: "inalipa",
    trackingNumber: "T6SW3F24",
    dateCreated: "2024-04-17T05:25:39.735Z",
    discounts: undefined,
    delivery: undefined,
    transactions: [],
    shops: [],
    refundTransactions: [],
    isDiscounted: false,
    paymentFeedbackReceived: false,
    disputed: false,
    hasPendingRefund: false,
    hasPendingDispute: false,
    trackingUrl: "",
    refundAllowed: false,
    user: undefined,
    source: "",
    referenceNumber: "",
    items: [],
    uuid: "",
    lastUpdate: "",
    __v: 0,
    paymentFeedbackReceivedAt: "",
    metadata: undefined,
  },
];
