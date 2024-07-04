const axios = require("axios").default;
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");

const write2file = (data) => {
  let list = JSON.stringify(data);

  let file = path.join(__dirname, "newList.json");

  fs.writeFile(file, list, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("写入成功");
    }
  });
};

(async () => {
  //http
  const https = axios.create({
    proxy: {
      protocol: "http",
      host: "127.0.0.1",
      port: 7890,
    },
  });

  const html = await https
    .get(`https://www.urbandictionary.com`)
    .then((res) => res.data);

  const $ = cheerio.load(html);
  const href = $(`a[aria-label="Last page"]`).attr("href");

  const totalPage = new URLSearchParams(href.replace("/", "")).get("page");
  // console.log(totalPage1);
  let data = [];
  $(".definition").each((i, ele) => {
    const word = $(ele).find(".word").text();
    const mean = $(ele).find(".meaning").text();
    const example = $(ele).find(".example").text();
    // console.log(word);
    data.push({ word, mean, example });
  });

  const request = (page) => {
    return new Promise((resolve) => {
      https
        .get(`https://www.urbandictionary.com?page=${page}`)
        .then((res) => {
          // console.log(res.data);
          const $ = cheerio.load(res.data);
          // let data = [];
          $(".definition").each((i, ele) => {
            let word = $(ele).find(".word").text();
            let mean = $(ele).find(".meaning").text();
            const example = $(ele).find(".example").text();
            // console.log(word);
            data.push({ word, mean, example });
          });
          console.log("爬取成功", page, "页");
          // return data;
          resolve(data);
        })
        .catch((err) => {
          console.error("爬取失败", page, "页");
          resolve([]);
        });
    });
  };

  // data = data.concat(
  //   (
  //     await Promise.all(
  //       new Array(totalPage - 1).fill(0).map((i, index) => {
  //         return request(index + 2);
  //       })
  //     )
  //   ).flat()
  // );

  await Promise.all(
    new Array(totalPage - 1).fill(0).map((i, index) => {
      return request(index + 2);
    })
  );

  write2file(data);
})();
