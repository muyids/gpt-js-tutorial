export function search_ticket(from, to, date) {
    // Your code here
    console.log(`search ticket from ${from} to ${to} on ${date}`);

    return {
        ticket_number: "123456",
        from: from,
        to: to,
        date: date,
        price: 900
    }
}

export function order_ticket(from, to, date) {
    // Your code here
    console.log(`Order ticket from ${from} to ${to} on ${date}`);

    return {
        ticket_number: "123456",
        from: from,
        to: to,
        date: date,
        price: 1000
    }
}