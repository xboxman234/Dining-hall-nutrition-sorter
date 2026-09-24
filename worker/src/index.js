export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date"); // expects "2026-09-10"
    const type = url.searchParams.get("type");
    let upstream = "";
    
    if (type=="multi"){
      let id = url.searchParams.get("id");
      let d = url.searchParams.get("date");
      let loc = url.searchParams.get("loc");
//Menu date is in dashes
      upstream = `https://wisc-housingdining.api.nutrislice.com/menu/api/menu-items/${id}/order-settings/?location-id=${45371}&menu-date=${d}`;
      console.log("thing:"+upstream)



    }else{
    const market = url.searchParams.get("market");
    const meal = url.searchParams.get("meal");
    
      //date in slashes
     upstream = `https://wisc-housingdining.api.nutrislice.com/menu/api/weeks/school/${market}/menu-type/${meal}/${dateParam}/`;
  }
  console.log(type)
    const resp = await fetch(upstream, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const data = await resp.text();

    return new Response(data, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": resp.ok ? "public, max-age=3600" : "no-store"
      }
    });
  }
};