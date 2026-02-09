# Welcome to your Convex functions directory!

Write your Convex functions here. See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

```ts
// functions.js
import { query } from './_generated/server'
import { v } from 'convex/values'

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query('tablename').collect()

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second)

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents
  },
})
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.functions.myQueryFunction, {
  first: 10,
  second: 'hello',
})
```

A mutation function looks like:

```ts
// functions.js
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second }
    const id = await ctx.db.insert('messages', message)

    // Optionally, return a value from your mutation.
    return await ctx.db.get(id)
  },
})
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.functions.myMutationFunction)
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: 'Hello!', second: 'me' })
  // OR
  // use the result once the mutation has completed
  mutation({ first: 'Hello!', second: 'me' }).then((result) => console.log(result))
}
```

Use the Convex CLI to push your functions to a deployment. See everything the Convex CLI can do by running `npx convex -h` in your project root directory. To learn more, launch the docs with `npx convex docs`.

---

---

## Schema Entities Table

| Requested Entity | Present? | Type | Details in Schema |
| --- | --- | --- | --- |
| `Users` | ✅ | `.defineEnt()` | via `users` |
| `Products` | ✅ | `.defineEnt()` | via `products` |
| `UserProducts` | ✅ | Join Table | via `userProducts` |
| `TransactionProducts` | ✅ | Join Table | via `transactionProducts` |
| `Transactions` | ✅ | `.defineEnt()` | via `transactions` |
| `UserBuyerTransactions` | ✅ | Join Table | via `userBuyerTransactions` |
| `UserSellerTransactions` | ✅ | Join Table | via `userSellerTransactions` |
| `EventTransactions` | ✅ | via `.edge("event")` | `transactions.edge("event")` <-> `events.edges("transactions")` |
| `Collections` | ✅ | `.defineEnt()` | via `collections` |
| `CollectionProducts` | ✅ | via bidirectional edges | `products.edge("collection")` and `collections.edges("products")` |
| `UserCollections` | ✅ | via bidirectional edges | `collections.edge("user")` and `users.edges("collections")` |
| `Events` | ✅ | `.defineEnt()` | via `events` |
| `EventAttendees` | ✅ | via `.edges("users")` | `events.edges("users")` + `users.edges("events")` |
| `EventProducts` | ✅ | via `.edges("products")` | same |

## Cardinality Table

| Cardinality Rule | OK ? | Justification |
| --- | --- | --- |
| A user can make multiple transactions | ✅ | via `userBuyerTransactions` and `userSellerTransactions` |
| A user can have multiple collections | ✅ | via `users.edges("collections")` |
| A user can have multiple products | ✅ | via `userProducts` |
| A user can participate in multiple events | ✅ | via `users.edges("events")` |
| A product can be associated with multiple transactions | ✅ | via `transactionProducts` |
| A product can belong to multiple collections | ✅ | via `products.edge("collection")` and `collections.edges("products")` |
| A product can belong to multiple users | ✅ | via `userProducts` |
| A product can belong to multiple events | ✅ | via `products.edges("events")` |
| A transaction belongs to two users (buyer/seller) | ✅ | via `userBuyerTransactions`, `userSellerTransactions` |
| A transaction contains at least one product | ✅ | via `transactionProducts` |
| A transaction can be linked to an event | ✅ | via `.edge("event")` |
| A collection is linked to a user | ✅ | via `.edge("user")` in `collections` |
| A collection contains multiple products | ✅ | via `.edges("products")` in `collections` |
| An event groups multiple users | ✅ | via `.edges("users")` |
| An event can offer products | ✅ | via `.edges("products")` |
| An event can have transactions | ✅ | via `.edges("transactions")` |

---

## 📘 Enums

### Roles

- Administrator, Board of directors, Founding members, Member representative, Member, Unregistered, Guest

### Conditions

- New, Used, Damaged, Refurbished, Mint, Unopened, Sealed, Vintage, Limited Edition, Damaged Box, Damaged Item

### Status

- In Stock, Sold, Reserved, Out of Stock, On Sale, In Collection, Archived, Pre-Order, In Auction, Pending, Shipped, Discontinued

### ProductTypes

- Prepainted, Action/Doll, Trading Card, Garage Kit, Model Kit, Accessory, Plushie, Linen, Dish, Hanged up / On Wall, Apparel, Stationery, Books, Music, Video, Game, Software, Miscellaneous
