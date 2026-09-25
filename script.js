
// Api name : display name
const NAMES = {
    "four-lakes-market": "Four Lakes",
    "carsons-market": "Carson's",
    "gordon-avenue-market": "Gordon Avenue",
    "lizs-market": "Liz's",
    "rhetas-market": "Rheta's"
};

// gets the menu for the week from nutrislice
async function getMenu(market, meal) {
    let date = new Date().toLocaleDateString('sv-SE').replaceAll("-", "/");
    const link = "https://worker.mrtylersolid.workers.dev/?market=" + market + "&meal=" + meal + "&date=" + date;
    console.log(link);
    try {
        const response = await fetch(link);
        if (!response.ok) {
            alert("Something lowk went wrong");

            return;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch or parse Nutrislice menu:', error);
    }
    return 1;
}

// get a list of items (provided by getMenu) and return their properties
async function getItems(id) {
    //change date later
    let date = new Date().toLocaleDateString('sv-SE');
    const link = "https://worker.mrtylersolid.workers.dev/?type=multi&id=" + id + "&date=" + date;
    console.log(link);
    try {
        const response = await fetch(link);
        if (!response.ok) {
            alert("Something lowk went wrong");

            return;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch or parse Nutrislice menu:', error);
    }
    return 1;
}

// do everything
async function doEverything() {
    // week of menus for a market
    var week;

    // current day in terms of the returned menu
    var day = null;

    // eventual menu to put to the screen
    var menu = [];

    //Which markets are used for menu decided by checkboxes
    var locations = [];
    document.getElementById("four-lakes-market").checked && locations.push(document.getElementById("four-lakes-market").value)
    document.getElementById("carsons-market").checked && locations.push(document.getElementById("carsons-market").value)
    document.getElementById("gordon-avenue-market").checked && locations.push(document.getElementById("gordon-avenue-market").value)
    document.getElementById("lizs-market").checked && locations.push(document.getElementById("lizs-market").value)
    document.getElementById("rhetas-market").checked && locations.push(document.getElementById("rhetas-market").value)

    // loading bar to show that things are in fact working
    document.getElementById("loading").textContent = "Loading...";
    document.getElementById("meal").disabled = true;
    document.getElementById("field").disabled = true;


    document.querySelectorAll(".Item").forEach(element => {
        element.remove();

    });

    try {

        // fetch the menus from all checked markets at once and return when they get returned (meal comes from dropdown)
        var fetchdays = locations.map(async (item) => {
            const response = await getMenu(item, document.getElementById("meal").value);
            return await response;
        });
        var alldays = await Promise.all(fetchdays)
        // list of ids per day
        let ids = [];
        // Loop through each market return menu
        for (var week = 0; week < alldays.length; week++) {
            document.getElementById("loading").textContent += ".";

            // ids for subset foods like yogurt bar

            console.log("location" + locations[week]);

            // loop through each day of the week to see if its today (probaly a better way to do this)
            for (var i of alldays[week]["days"]) {
                console.log(new Date().toLocaleDateString('sv-SE'))
                if (i["date"] === new Date().toLocaleDateString('sv-SE')) {
                    day = i;
                }
            }
            console.log(day)

            // loop through every item of the list of foods of the day of the week
            for (var i of day["menu_items"]) {
                // skip useless values
                if (i["food"] == null || i["food"]["is_section_title"]) {
                    continue;
                }

                // push nested foods ids to ids to get later
                // each entry is the id and the object


                if (i["food"]["nested_foods"].length != 0) {
                    ids.push([i["id"], i["food"]["nested_foods"], NAMES[locations[week]]]);
                    console.log(i["id"], i["food"]["nested_foods"])
                    continue
                }



                // target lowk returns the object with the same name as the one we are looking at
                // if it exists, it just adds the market if it doesnt it makes a new entry
                var target = Object.values(menu).find(user => user.name === i["food"]["name"]);
                if (target) {
                    if (!target.locations.includes(NAMES[locations[week]])) {
                        target.locations.push(NAMES[locations[week]]);
                    }
                }
                else {
                    // menu item
                    menu.push({

                        "name": i["food"]["name"],
                        "protien": i["food"]["rounded_nutrition_info"]["g_protein"],
                        "calories": i["food"]["rounded_nutrition_info"]["calories"],
                        "ratio":
                            parseFloat(i["food"]["rounded_nutrition_info"]["g_protein"]) / parseFloat(i["food"]["rounded_nutrition_info"]["calories"]),
                        "locations": [NAMES[locations[week]]],
                        "serving": i["food"]["serving_size_info"]["serving_size_amount"]+" servings, "+i["food"]["serving_size_info"]["serving_size_unit"]
                    })
                }
            }
        }

        // the list of ids returned from the last call
        let fetchids = ids.map(async (item) => {
            // for some reason the location is the same for all markets
            let response = await getItems(item[0], 45371);
            return await response;
        });
        // send all awaits at the same time
        var idsResponses = await Promise.all(fetchids)
        console.log("ids", ids)

        // loop through the retuned id nutrition info
        for (var i = 0; i < ids.length; i++) {
            

            let items = idsResponses[i];
            console.log("-----")
            console.log(items)
            console.log("nested", items["nested_option_container_map"])

            // forgot why i need to loop through here again
            for (var l of ids[i][1]) {
                // supposed to give an indication of how its loading, lowk doesnt work at all idk why
                document.getElementById("loading").textContent += ".";
                // thing is the parent of the food
                var thing = items.nested_option_container_map[l]
                console.log(thing)

                // see if the name is already in menu
                var target = Object.values(menu).find(user => user.name === thing["name"]);
                if (target) {
                    if (!target.locations.includes(ids[i][2])) {
                        target.locations.push(ids[i][2]);
                    }

                } else {
                    menu.push({
                        "name": thing["name"],
                        "protien": thing["rounded_nutrition_info"]["g_protein"],
                        "calories": thing["rounded_nutrition_info"]["calories"],
                        "ratio":
                            parseFloat(thing["rounded_nutrition_info"]["g_protein"]) / parseFloat(thing["rounded_nutrition_info"]["calories"])
                        , "locations": [ids[i][2]],
                        "serving": thing["serving_size_info"]["serving_size_amount"]+" servings, "+thing["serving_size_info"]["serving_size_unit"]
                    })
                }

            }
        }

    } catch {
        alert("Something pertaining to the api data went wrong")
    } finally {
        document.getElementById("meal").disabled = false;
        document.getElementById("field").disabled = false;
    }


    // sort by ratio (or 0 if its undefined or somthing)
    menu.sort((a, b) => (b.ratio || 0) - (a.ratio || 0))
    document.getElementById("loading").textContent = "";

    // create menu items, make pretty later
    for (i of menu) {
        const item = document.createElement("div");
        item.className = "Item"

        //item.style.border = "3px solid black";
        item.style.background="#f5f5f5"
        //"Calories" + i.calories + "Protien:" + i.protien + " " + i.name +i.week
        item.appendChild(
            Object.assign(document.createElement("p"),
                { textContent: i.locations.join(", ") + ": " + i.name + " " + i.protien + " grams of protien " + i.calories + " calories for " + i.serving}))
        document.querySelector(".itemsdiv").appendChild(item);

    }
    document.getElementById("meal").disabled = false;
    document.getElementById("field").disabled = false;
    console.log(menu)

};
console.log("test2")

// run on page load
doEverything();

// run again on dropdown change
document.getElementById("meal").addEventListener("change", () => {
    console.log("VERY IMPORTANT")
    doEverything();
})

// run again on market buttons change
document.getElementById("field").addEventListener("change", () => {
    console.log("VERY IMPORTANT")
    doEverything();
})