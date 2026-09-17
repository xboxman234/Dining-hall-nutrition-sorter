// menu https://wisc-housingdining.nutrislice.com/menu

//ToDO:
// Breakfast Lunch and Dinner checkboxes
// Market Checkboxes
//
var week;
var day;
var menu = [];
var locations = [
    "four-lakes-market",
    "carsons-market",
    "gordon-avenue-market",
    "lizs-market",
    "rhetas-market"


];
async function getMenu(market, meal) {
    //change date later
    const link = "https://worker.mrtylersolid.workers.dev/?market=" + market + "&meal=" + meal;
    console.log(link);
    try {
        const response = await fetch(link);
        if (!response.ok) {
            alert("bad");
            return;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch or parse Nutrislice menu:', error);
    }
    return 1;
}
async function getItems(id, loc) {
    //change date later
    const link = "https://worker.mrtylersolid.workers.dev/?type=multi&id=" + id + "&loc=" + loc;
    console.log(link);
    try {
        const response = await fetch(link);
        if (!response.ok) {
            alert("bad");
            return;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch or parse Nutrislice menu:', error);
    }
    return 1;
}
const fetchdays = locations.map(async (item) => {
    const response = await getMenu(item, "lunch");
    return await response;
});
(async () => {
    allthefellas = await Promise.all(fetchdays)
    console.log(allthefellas)
    for (week of allthefellas) {
        //week = await getMenu("four-lakes-market", "dinner")
        ids = [];
        console.log("hi", week);


        for (var i of week["days"]) {
            console.log(new Date().toLocaleDateString('sv-SE'))
            if (i["date"] === new Date().toLocaleDateString('sv-SE')) {
                day = i;
            }
        }
        console.log(day)

        for (var i of day["menu_items"]) {
            if (i["food"] == null || i["food"]["is_section_title"]) {
                continue;
            }
            if (i["food"]["nested_foods"].length != 0) {
                ids.push([i["id"], i["food"]["nested_foods"]]);
                console.log(i["id"], i["food"]["nested_foods"])
                continue
            }
            menu.push({
                "name": i["food"]["name"],
                "protien": i["food"]["rounded_nutrition_info"]["g_protein"],
                "calories": i["food"]["rounded_nutrition_info"]["calories"],
                "ratio":
                    parseFloat(i["food"]["rounded_nutrition_info"]["g_protein"]) / parseFloat(i["food"]["rounded_nutrition_info"]["calories"])
            })
        }
        let fetchids = ids.map(async (item) => {
            let response = await getItems(item[0], 45371);
            return await response;
        });
        idsResponses = await Promise.all(fetchids)
        console.log("ids", ids)
        for (var i = 0; i < ids.length; i++) {
            items = idsResponses[i]
            console.log("-----")
            console.log(items)
            console.log("nested", items["nested_option_container_map"])
            for (var l of ids[i][1]) {
                thing = items.nested_option_container_map[l]
                console.log(thing)
                menu.push({
                    "name": thing["name"],
                    "protien": thing["rounded_nutrition_info"]["g_protein"],
                    "calories": thing["rounded_nutrition_info"]["calories"],
                    "ratio":
                        parseFloat(thing["rounded_nutrition_info"]["g_protein"]) / parseFloat(thing["rounded_nutrition_info"]["calories"])
                })

            }
        }
        menu.sort((a, b) => b.ratio - a.ratio)
        for (i of menu) {
            const item = document.createElement("div");

            item.style.border = "3px solid black";
            item.appendChild(
                Object.assign(document.createElement("p"), { textContent: "Calories" + i.calories + "Protien:" + i.protien + " " + i.name }))
            document.body.appendChild(item);

        }

        
    }
    menu.sort((a, b) => b.ratio - a.ratio)
        console.log(menu)
})();

