/* =========================================
   RENT ROCK RETURN - BOOKING SYSTEM
   ========================================= */


/* =========================================
   GET CURRENT BOOKING LIST
   ========================================= */

function getBookingList() {

    return JSON.parse(
        localStorage.getItem("rentRockReturnBooking")
    ) || [];

}


/* =========================================
   SAVE BOOKING LIST
   ========================================= */

function saveBookingList(bookingList) {

    localStorage.setItem(
        "rentRockReturnBooking",
        JSON.stringify(bookingList)
    );

}


/* =========================================
   FORMAT DATE
   ========================================= */

function formatRentalDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;

}


/* =========================================
   GET NEXT DAY / RETURN DATE
   ========================================= */

function getReturnDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    date.setDate(
        date.getDate() + 1
    );


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;

}


/* =========================================
   UPDATE AVAILABILITY
   ========================================= */

function updateAvailability(outfitName) {

    const dateSelect =
        document.getElementById("date");


    if (!dateSelect) {
        return;
    }


    const bookingList =
        getBookingList();


    const options =
        dateSelect.querySelectorAll("option");


    options.forEach(function(option) {

        if (!option.value) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * A date will be considered BOOKED
         * only when paymentConfirmed is true.
         *
         * Pending / unpaid bookings will NOT
         * make the date red.
         */

        const isBooked =
            bookingList.some(function(item) {

                return (
                    item.name === outfitName &&
                    item.rentalDate === option.value &&
                    item.paymentConfirmed === true
                );

            });


        /*
         * Remove old availability symbols
         * before adding the latest one.
         */

        const originalText =
            option.textContent
                .replace("🟢", "")
                .replace("🔴", "")
                .trim();


        if (isBooked) {

            option.textContent =
                originalText + " — 🔴";

            option.disabled = true;

        } else {

            option.textContent =
                originalText + " — 🟢";

            option.disabled = false;

        }

    });

}


/* =========================================
   ADD TO BOOKING
   ========================================= */

function addToBooking(name, price) {

    const dateSelect =
        document.getElementById("date");


    /*
     * Date must be selected first.
     */

    if (!dateSelect || !dateSelect.value) {

        alert(
            "Please select a rental date first."
        );

        return;

    }


    const rentalDate =
        dateSelect.value;


    let bookingList =
        getBookingList();


    /*
     * Check whether the same outfit
     * is already in the booking list
     * for the same date.
     *
     * This includes pending bookings.
     */

    const alreadyInBooking =
        bookingList.some(function(item) {

            return (
                item.name === name &&
                item.rentalDate === rentalDate
            );

        });


    if (alreadyInBooking) {

        alert(
            "This outfit is already added for this date."
        );

        return;

    }


    /*
     * Add outfit as PENDING.
     *
     * It is NOT booked yet.
     *
     * Only successful payment of
     * 50% or more will make
     * paymentConfirmed = true.
     */

    bookingList.push({

        name: name,

        price: Number(price),

        rentalDate: rentalDate,

        returnDate:
            getReturnDate(rentalDate),

        paymentConfirmed: false,

        paymentAmount: 0

    });


    /*
     * Save booking.
     */

    saveBookingList(
        bookingList
    );


    alert(
        name +
        " added to your booking for " +
        formatRentalDate(rentalDate) +
        "!"
    );


    /*
     * Open My Booking page.
     */

    window.location.href =
        "my-booking.html";

}


/* =========================================
   REMOVE BOOKING
   ========================================= */

function removeFromBooking(index) {

    let bookingList =
        getBookingList();


    if (
        index < 0 ||
        index >= bookingList.length
    ) {
        return;
    }


    bookingList.splice(
        index,
        1
    );


    saveBookingList(
        bookingList
    );


    location.reload();

}


/* =========================================
   PAYMENT CONFIRMATION
   ========================================= */

/*
 * This function will be used later
 * when the payment is successfully completed.
 *
 * 50% or more payment = confirmed.
 */

function confirmPayment(index, paymentAmount) {

    let bookingList =
        getBookingList();


    if (
        index < 0 ||
        index >= bookingList.length
    ) {
        return false;
    }


    const rentalAmount =
        Number(
            bookingList[index].price
        );


    const minimumPayment =
        rentalAmount / 2;


    const amount =
        Number(paymentAmount);


    /*
     * Payment must be at least 50%.
     */

    if (amount < minimumPayment) {

        alert(
            "Minimum 50% payment is required to confirm the booking."
        );

        return false;

    }


    /*
     * Payment successful.
     * Now booking becomes CONFIRMED.
     */

    bookingList[index].paymentConfirmed =
        true;


    bookingList[index].paymentAmount =
        amount;


    saveBookingList(
        bookingList
    );


    return true;

}


/* =========================================
   PAGE LOAD
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
         * Outfit name is taken from
         * the product page heading.
         */

        const heading =
            document.querySelector(
                ".product-info h1"
            );


        if (heading) {

            const outfitName =
                heading.textContent.trim();


            updateAvailability(
                outfitName
            );

        }

    }
);