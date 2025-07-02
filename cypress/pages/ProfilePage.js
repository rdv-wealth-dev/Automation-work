// ProfilePage.js
import LoginPage from "./LoginPage";
import DashboardPage from "./Dashboard";
import { helpers, safeSelectByLabel } from "../../utils/helpers";
import { testData } from "../support/testData";

class ProfilePage {
  openProfileFromHeader() {
    cy.get(".ri-arrow-down-s-line").click();
    cy.contains("a.dropdown-item", "Profile").click();
    cy.url().should("include", "/profile");
  }

  /** * ✅ Compares only:
   * - Header Name vs Profile Heading  * - Header Org ID vs Profile Org ID Field */

  verifyHeaderDetailsAgainstProfile() {
    cy.get(".user-name-text")
      .invoke("text")
      .then((headerNameRaw) => {
        const headerName = headerNameRaw.trim();

        cy.get(".user-name-sub-text span")
          .invoke("text")
          .then((headerIdRaw) => {
            const headerID = headerIdRaw.trim();

            this.openProfileFromHeader();

            // Wait for profile page to fully load
            cy.get('[class*="profile"], [class*="detail"], .container', {
              timeout: 10000,
            }).should("be.visible");

            // Check role and verify accordingly
            const currentRole = Cypress.env("role");

            if (currentRole === "admin") {
              // Wait for Organization Name field to be visible and have text
              cy.get("#organizationname", { timeout: 15000 })
                .should("be.visible")
                .should("not.be.empty")
                .and("not.contain.text", "Loading...")
                .and("not.contain.text", "...")
                .invoke("text")
                .then((organizationNameRaw) => {
                  const organizationName = organizationNameRaw.trim();

                  // Wait for Organization ID field
                  cy.get("#phonenumberInput", { timeout: 10000 })
                    .should("be.visible")
                    .should("not.be.empty")
                    .invoke("text")
                    .then((organizationIdRaw) => {
                      const organizationId = organizationIdRaw.trim();

                      // Save to Cypress.env() for future use
                      Cypress.env("orgName", organizationName);
                      Cypress.env("orgId", organizationId);

                      // Detailed Logs with actual vs expected
                      cy.log(`📋 ADMIN PROFILE COMPARISON:`);
                      cy.log(`📍 Header Name (Expected): "${headerName}"`);
                      cy.log(
                        `🏢 Organization Name (Actual): "${organizationName}"`
                      );
                      cy.log(`🆔 Header ID (Expected): "${headerID}"`);
                      cy.log(
                        `🆔 Organization ID (Actual): "${organizationId}"`
                      );

                      // Console mein bhi print karo
                      console.log("🔍 ADMIN VERIFICATION RESULTS:");
                      console.log("Expected Header Name:", headerName);
                      console.log(
                        "Actual Organization Name:",
                        organizationName
                      );
                      console.log("Expected Header ID:", headerID);
                      console.log("Actual Organization ID:", organizationId);

                      // Enhanced Assertions with better error messages
                      if (organizationName === "") {
                        cy.log(
                          "❌ Organization Name field is empty - retrying..."
                        );
                        cy.wait(2000); // Wait a bit more
                        cy.reload(); // Reload if needed
                        this.openProfileFromHeader();
                      } else {
                        expect(
                          organizationName,
                          `Organization Name should match Header Name. Expected: "${headerName}", but got: "${organizationName}"`
                        ).to.eq(headerName);
                      }

                      if (organizationId === "") {
                        cy.log(
                          "❌ Organization ID field is empty - retrying..."
                        );
                        cy.wait(2000);
                      } else {
                        expect(
                          organizationId,
                          `Organization ID should match Header ID. Expected: "${headerID}", but got: "${organizationId}"`
                        ).to.eq(headerID);
                      }
                    });
                });
            } else if (currentRole === "employee") {
              // Wait for Employee Name field to be visible and have text
              cy.get("#organizationname", { timeout: 15000 })
                .should("be.visible")
                .should("not.be.empty")
                .and("not.contain.text", "Loading...")
                .invoke("text")
                .then((employeeNameRaw) => {
                  const employeeName = employeeNameRaw.trim();

                  // Wait for Organization ID field
                  cy.get("#phonenumberInput", { timeout: 10000 })
                    .should("be.visible")
                    .should("not.be.empty")
                    .invoke("text")
                    .then((organizationIdRaw) => {
                      const organizationId = organizationIdRaw.trim();

                      // Save to Cypress.env() for future use
                      Cypress.env("empName", employeeName);
                      Cypress.env("orgId", organizationId);

                      // Detailed Logs with actual vs expected
                      cy.log(`📋 EMPLOYEE PROFILE COMPARISON:`);
                      cy.log(`📍 Header Name (Expected): "${headerName}"`);
                      cy.log(`👨‍💼 Employee Name (Actual): "${employeeName}"`);
                      cy.log(`🆔 Header ID (Expected): "${headerID}"`);
                      cy.log(
                        `🆔 Organization ID (Actual): "${organizationId}"`
                      );

                      // Console mein bhi print karo
                      console.log("🔍 EMPLOYEE VERIFICATION RESULTS:");
                      console.log("Expected Header Name:", headerName);
                      console.log("Actual Employee Name:", employeeName);
                      console.log("Expected Header ID:", headerID);
                      console.log("Actual Organization ID:", organizationId);

                      // Enhanced Assertions with better error messages
                      if (employeeName === "") {
                        cy.log("❌ Employee Name field is empty - retrying...");
                        cy.wait(2000);
                        cy.reload();
                        this.openProfileFromHeader();
                      } else {
                        expect(
                          employeeName,
                          `Employee Name should match Header Name. Expected: "${headerName}", but got: "${employeeName}"`
                        ).to.eq(headerName);
                      }

                      if (organizationId === "") {
                        cy.log(
                          "❌ Organization ID field is empty - retrying..."
                        );
                        cy.wait(2000);
                      } else {
                        expect(
                          organizationId,
                          `Organization ID should match Header ID. Expected: "${headerID}", but got: "${organizationId}"`
                        ).to.eq(headerID);
                      }
                    });
                });
            }
          });
      });
  }

  /**
   * 🔍 Verify profile details based on user role - Admin ke liye alag, Employee ke liye alag
   */
  verifyProfileDetails() {
    const currentRole = Cypress.env("role");

    if (currentRole === "admin") {
      this.verifyAdminProfileDetails();
    } else if (currentRole === "employee") {
      this.verifyEmployeeProfileDetails();
    } else {
      cy.log("❌ Unknown role detected, skipping profile verification");
    }
  }

  /**
   * 👑 Admin ke liye profile details verification with proper wait conditions
   */
  verifyAdminProfileDetails() {
    // Read expected values from Cypress.env
    const expectedValues = {
      "Organization Name": Cypress.env("orgName") || "",
      "Organization ID": Cypress.env("orgId") || "",
    };

    const adminFields = [
      { label: "Organization Name", selector: "#organizationname" },
      { label: "Organization ID", selector: "#phonenumberInput" },
      { label: "Email", selector: "#emailInput" },
      { label: "Country Code", selector: "#zipcodeInput" },
      { label: "Mobile Number", selector: "#mobilenumberInput" },
      { label: "Pin Code", selector: "#pincodeInput" },
      { label: "Country", selector: "#countryInput" },
      { label: "City", selector: "#cityInput" },
      { label: "State", selector: "#state" },
      { label: "Industry Type", selector: "#Industryinput" },
      {
        label: "Website Url (Optional)",
        selector: "#webInput",
        optional: true,
      },
    ];

    const summary = [];

    adminFields.forEach((field) => {
      // Add proper wait conditions for each field
      cy.get(field.selector, { timeout: 10000 })
        .should("be.visible")
        .wait(500) // Small wait to ensure content is loaded
        .invoke("text")
        .then((actualText) => {
          const actual = actualText.trim();
          const expected = expectedValues[field.label] || "";
          const match = expected ? (actual === expected ? "✅" : "❌") : "N/A";

          // Enhanced logging with actual vs expected
          cy.log(`🔍 ${field.label}:`);
          cy.log(`   Expected: "${expected}"`);
          cy.log(`   Actual: "${actual}"`);
          cy.log(`   Match: ${match}`);

          summary.push({
            Field: field.label,
            "Expected Value": expected || "(Not Provided)",
            "Actual Value": actual || "(Empty)",
            Match: match,
          });

          // Console mein bhi print karo
          console.log(
            `🔍 ${field.label}: Expected="${expected}", Actual="${actual}", Match=${match}`
          );

          if (expected && !field.optional) {
            if (actual === "") {
              cy.log(`❌ ${field.label} field is empty, retrying...`);
              cy.wait(1000);
              // Retry once more
              cy.get(field.selector)
                .invoke("text")
                .then((retryText) => {
                  const retryActual = retryText.trim();
                  expect(
                    retryActual,
                    `${field.label} should match after retry. Expected: "${expected}", but got: "${retryActual}"`
                  ).to.eq(expected);
                });
            } else {
              expect(
                actual,
                `${field.label} should match. Expected: "${expected}", but got: "${actual}"`
              ).to.eq(expected);
            }
          }
        });
    });

    cy.then(() => {
      console.log("🧾 Admin Profile Details Verification Summary");
      console.table(summary);
    });
  }

  /**
   * 👨‍💼 Employee ke liye profile details verification with proper wait conditions
   */
  verifyEmployeeProfileDetails() {
    // Read expected values from Cypress.env for employee
    const expectedValues = {
      "Employee Name": Cypress.env("empName") || "",
      "Organization ID": Cypress.env("orgId") || "",
    };

    const employeeFields = [
      { label: "Employee Name", selector: "#organizationname" },
      { label: "Organization ID", selector: "#phonenumberInput" },
      { label: "Email", selector: "#emailInput" },
      { label: "Role", selector: "#roleInput" },
      { label: "Team", selector: "#teamInput" },
      { label: "Registered Date", selector: "#registeredInput" },
      { label: "Device Name", selector: "#deviceNameInput" },
      { label: "App Version", selector: "#versionInput" },
      { label: "Call Recording Sync", selector: "#callrecordingInput" },
      { label: "Last Call Sync", selector: "#lastcallrecordingInput" },
    ];

    const summary = [];

    employeeFields.forEach((field) => {
      // Add proper wait conditions for each field
      cy.get(field.selector, { timeout: 10000 })
        .should("be.visible")
        .wait(500) // Small wait to ensure content is loaded
        .invoke("text")
        .then((actualText) => {
          const actual = actualText.trim();
          const expected = expectedValues[field.label] || "";
          const match = expected ? (actual === expected ? "✅" : "❌") : "N/A";

          // Enhanced logging with actual vs expected
          cy.log(`🔍 ${field.label}:`);
          cy.log(`   Expected: "${expected}"`);
          cy.log(`   Actual: "${actual}"`);
          cy.log(`   Match: ${match}`);

          summary.push({
            Field: field.label,
            "Expected Value": expected || "(Not Provided)",
            "Actual Value": actual || "(Empty)",
            Match: match,
          });

          // Console mein bhi print karo
          console.log(
            `🔍 ${field.label}: Expected="${expected}", Actual="${actual}", Match=${match}`
          );

          if (expected && !field.optional) {
            if (actual === "") {
              cy.log(`❌ ${field.label} field is empty, retrying...`);
              cy.wait(1000);
              // Retry once more
              cy.get(field.selector)
                .invoke("text")
                .then((retryText) => {
                  const retryActual = retryText.trim();
                  expect(
                    retryActual,
                    `${field.label} should match after retry. Expected: "${expected}", but got: "${retryActual}"`
                  ).to.eq(expected);
                });
            } else {
              expect(
                actual,
                `${field.label} should match. Expected: "${expected}", but got: "${actual}"`
              ).to.eq(expected);
            }
          }
        });
    });

    cy.then(() => {
      console.log("🧾 Employee Profile Details Verification Summary");
      console.table(summary);
    });
  }

  verifyProfileUpdate() {
    const currentRole = Cypress.env("role");

    if (currentRole === "admin") {
      this.verifyAdminProfileUpdate();
    } else if (currentRole === "employee") {
      this.verifyEmployeeProfileUpdate();
    } else {
      cy.log("❌ Unknown role detected, skipping profile verification");
    }
  }

  /**
   * 👑 Admin ke liye profile details verification with proper wait conditions
   */
  verifyAdminProfileUpdate() {
    cy.xpath("//button[normalize-space()='Update']").click();
    cy.contains("Personal").should("be.visible");
    cy.url().should("include", "/update/personal");

    // 👀 Check if Email field is disabled or read-only
    cy.get('form[action="#"] input[name="email"]')
      .should("be.visible")
      .and("be.disabled"); // OR use .and('be.disabled') based on actual HTML

    // 🔄 Update editable fields data from fixture file(for static data)
    cy.fixture("profileData").then((data) => {
      const updatedData = data.admin;

      ////Update data from support/testdata file(for dynamic data)
      // const updatedData = testData.admin;

      cy.intercept("GET", "**/get-organization-profile").as("getOrgProfile");
      cy.wait("@getOrgProfile");
      cy.wait(5000);
      // cy.reactClearAndType("input[placeholder='Enter Organization Name']", updatedData.orgName);

      cy.get('form[action="#"] input[name="organizationName"]')
        .clear({ force: true })
        .should("have.value", "")
        .type(updatedData.orgName, { delay: 100 })
        .should("have.value", updatedData.orgName);

      // // ✅ Step 1: Open country dropdown
      // cy.get(".selected-flag").click();

      // // ✅ Step 2: Search country in list
      // cy.get(".country-list .search-box").clear().type(updatedData.contactCode); // e.g., "India"

      // // ✅ Step 3: Wait & select exact country
      // cy.get(".country-list .country")
      //   .should("be.visible")
      //   .contains(
      //     ".country-name",
      //     new RegExp(`^${updatedData.contactCode}$`, "i")
      //   ) // Match exact name
      //   .click({ force: true });

      // // ✅ Step 4: Type phone number (force Formik sync)
      // cy.get('.react-tel-input input[type="tel"]')
      //   .clear({ force: true })
      //   .type(updatedData.contactNumber, { delay: 100 })
      //   .trigger("input")
      //   .trigger("change", { force: true })
      //   .blur();

      cy.get('form[action="#"] input[name="pincode"]')
        .clear()
        .type(updatedData.pincode);

      helpers.safeSelectByLabel("Select Country", updatedData.country);

      cy.get('form[action="#"] input[name="city"]')
        .clear()
        .type(updatedData.city);

      cy.get('form[action="#"] input[name="stateData"]')
        .clear()
        .type(updatedData.state);

      helpers.safeSelectByLabel("Industry Type", updatedData.industry);
      cy.get('form[action="#"] select[id="industryType"]')
        .find("option:selected")
        .invoke("text")
        .then((val) => cy.log("✅ Selected Industry:", val));

      cy.get('form[action="#"] input[name="website"]')
        .clear()
        .type(updatedData.website);

      // 💾 Submit
      cy.xpath("//button[normalize-space()='Update']").click();

      // ✅ Check toast
      cy.get(".Toastify__toast--success", { timeout: 10000 })
        .should("be.visible")
        .and("contain.text", "profile upadated successfully");

      cy.wait(3000);

      cy.intercept("GET", "**/get-organization-profile").as("getOrgProfile");
      cy.wait("@getOrgProfile");

      //   // 🔍 Verify updated values reflect in profile DOM
      cy.get("#organizationname").invoke("text").should("eq", updatedData.orgName);
      cy.get("#zipcodeInput").should("contain.text", updatedData.countryCode1);
      // cy.get("#mobilenumberInput").should("contain.text",updatedData.contactNumber );
      cy.get("#pincodeInput").should("contain.text", updatedData.pincode);
      cy.get("#countryInput").should("contain.text", updatedData.country);
      cy.get("#cityInput").should("contain.text", updatedData.city);
      cy.get("#state").should("contain.text", updatedData.state);
      cy.get("#Industryinput").should("contain.text", updatedData.industry);
      cy.get("#webInput").should("contain.text", updatedData.website);
    });
  }

  verifyEmployeeProfileUpdate() {
    cy.xpath("//button[normalize-space()='Update']").click();
    cy.contains("Personal").should("be.visible");
    cy.url().should("include", "/update/personal");
    cy.wait(3000);

    // 👀 Check if Email field is disabled or read-only
    cy.get('form[action="#"] input[name="email"]')
      .should("be.visible")
      .and("be.disabled"); // OR use .and('be.disabled') based on actual HTML

    // 🔄 Update editable fields data from fixture file(for static data)
    cy.fixture("profileData").then((data) => {
      const updatedData = data.employee;

      // 🔄 Update editable fields
      // const updatedData = testData.employee;

      cy.get('form[action="#"] input[name="fullName"]')
        .clear()
        .type(updatedData.employeeName);

      cy.xpath("//button[normalize-space(text())='Update']").click();

      cy.get(".Toastify__toast--success", { timeout: 10000 })
        .should("be.visible")
        .and("contain.text", "Employee details updated successfully.");

      cy.wait(2000);

      //Assertion for New value updated
      cy.get("#organizationname")
        .invoke("text")
        .should("eq", updatedData.employeeName);
    });
  }

  //Check profile picture funtionality
  /**
   * 📤 Upload profile picture from /fixtures folder
   * @param {string} imagePath - File name inside fixtures (default: SamplePNGImage_3mbmb.png)
   */
  //Upload Profile Picture
  verifyUploadProfilePicture(imagePath = "SamplePNGImage_3mbmb.png") {
    cy.wait(3000);
    cy.get("#profile-img-file-input")
      .should("exist")
      .selectFile(`cypress/fixtures/${imagePath}`, { force: true });

    cy.get(".Toastify__toast--success", { timeout: 10000 })
      .should("be.visible")
      .and("contain.text", "Profile picture has been successfully updated.");
  }

  verifyRemoveProfilePicture() {
    cy.intercept("DELETE", /.*\/delete-profile[-]?image$/, (req) => {
      req.alias = "deleteProfileImage";
    });

    cy.get(".sn-profile-avatar-pic").should("exist").click({ force: true });

    //Asserstion for sucess message
    // cy.wait(2000)
    cy.wait("@deleteProfileImage").then((interception) => {
      const response = interception.response;

      if (
        response.statuscode === 200 &&
        response.body.sucess &&
        response.body.message.includes("image profile deleted")
      ) {
        console.log("Profile Image Removed Sucessfully");
        cy.get(".Toastify__toast--success")
          .should("be.visible")
          .and("contain.text", "image profile deleted");
      } else if (
        response.statuscode === 400 &&
        response.body.message.includes("Image profile does not exist")
      ) {
        console.log("No profile image to remove: " + response.body.message);
        expect(response.body.message).to.includes("not exist");
      }
      // else{
      //   throw new Error(`❌ Unexpected response: ${JSON.stringify(response.body.message)}`);
      // }
    });
  }
}

export default new ProfilePage();
