const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

const scrapeData = async () => {
  const browser = await puppeteer.launch();
  // browser.newPage() creates a new page and return a page object which interact with the content of the page
  const page = await browser.newPage();

  const data = [];
  try {
    // Loop through the pages put your desired number of pages
    for (let pageIdx = 1; pageIdx <= 10; pageIdx++) {
        // place the your desired url here with filters
      const url = `https://internshala.com/internships/computer-science,full-stack-development,mean-mern-stack,python-django,web-development-internship-in-delhi,gurgaon,noida/page-${pageIdx}/`;

    await page.goto(url, { waitUntil: "domcontentloaded" });

      const newData = await page.evaluate(() => {
        const items = document.querySelectorAll(
          ".container-fluid.individual_internship"
        );

        return Array.from(items).map((item) => {
          const h3Element = item.querySelector(".heading_4_5.profile a");
          const locationElement = item.querySelector(".location_link");
          const stipendElement = item.querySelector(
            ".stipend_container .stipend"
          );
          const durationElement = item.querySelector(
            ".other_detail_item_row .other_detail_item:nth-child(2) .item_body"
          );
          const timeElement = item.querySelector('.success_and_early_applicant_wrapper .status-small');
          const h3Text = h3Element ? h3Element.innerText : "N/A";
          const h3Link = h3Element ? h3Element.getAttribute("href") : "N/A";
          const location = locationElement
            ? locationElement.innerText.trim()
            : "N/A";
          const stipend = stipendElement ? stipendElement.innerText : "N/A";
          const duration = durationElement ? durationElement.innerText : "N/A";
          const time = timeElement ? timeElement.innerText : 'N/A';
          return {
            h3Text,
            h3Link: `https://internshala.com${h3Link}`,
            location,
            stipend,
            duration, time
          };
        });
      });

      // Check if all entries on the page are 'N/A' and break out of the loop
      if (
        newData.every(
          (entry) =>
            entry.h3Text === "N/A" &&
            entry.stipend === "N/A" &&
            entry.duration === "N/A"&&
            entry.time === 'N/A'
        )
      ) {
        console.log(
          `All entries on page ${pageIdx} are 'N/A'. Stopping iteration.`
        );
        break;
      }

      data.push(...newData);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }

  return data;
};

const writeToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Internship");

  // Add headers to the worksheet
  worksheet.addRow(["Title", " Link", "Location", "Stipend", "Duration","Posted Time"]);

  // Add data to the worksheet
  data.forEach((job) => {
    worksheet.addRow([
      job.h3Text,
      job.h3Link,
      job.location,
      job.stipend,
      job.duration,
      job.time
    ]);
  });

  // Save the workbook to a file
  await workbook.xlsx.writeFile("Internship.xlsx");
  console.log("Excel file created successfully");
};

// Main execution
(async () => {
  try {
    const data = await scrapeData();
    await writeToExcel(data);
  } catch (error) {
    console.error("Error:", error);
  }
})();
