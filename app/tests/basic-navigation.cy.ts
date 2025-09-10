describe("Basic Navigation Test", () => {
  // Define expected navigation items based on the page sections
  // These correspond to the sections defined in pages/index.vue
  const navigationItems = [
    {
      expectedSection: "skills",
      sectionSelector: "#skills",
      menuText: "Skills"
    },
    {
      expectedSection: "personality",
      sectionSelector: "#personality",
      menuText: "Personality"
    },
    {
      expectedSection: "projects",
      sectionSelector: "#projects",
      menuText: "Projekte"
    },
    {
      expectedSection: "experiences",
      sectionSelector: "#experiences",
      menuText: "Erfahrung"
    },
    {
      expectedSection: "certificates",
      sectionSelector: "#certificates",
      menuText: "Zertifikate"
    },
    {
      expectedSection: "faqs",
      sectionSelector: "#faqs",
      menuText: "FAQ"
    },
    {
      expectedSection: "testimonials",
      sectionSelector: "#testimonials",
      menuText: "Referenzen"
    },
    {
      expectedSection: "contact",
      sectionSelector: "#contact",
      menuText: "Kontakt"
    }
  ];

  beforeEach(() => {
    // Visit the homepage and resize to desktop resolution
    cy.visit("http://localhost:3000");
    cy.viewport(1920, 1080);

    // Wait for the page to fully load
    cy.get("[data-testid='hero-section'], .hero-section, #hero").should("be.visible");

    // Ensure we start at the top of the page
    cy.scrollTo("top");
    cy.wait(1000); // Allow scroll to complete
  });

  it("should navigate through all menu items and test scroll companion", () => {
    // Test each navigation item
    navigationItems.forEach((item, index) => {
      cy.log(`Testing navigation item ${index + 1}: ${item.menuText}`);

      // Step 1: Hover over the burger menu to reveal dropdown
      cy.get(".navigation-section__desktop-burger-button")
        .should("be.visible")
        .trigger("mouseenter");

      // Wait for dropdown to appear
      cy.get(".navigation-section__desktop-dropdown")
        .should("be.visible");

      // Step 2: Click on the navigation item
      cy.get(".navigation-section__dropdown-link")
        .contains(item.menuText)
        .should("be.visible")
        .click();

      // Step 3: Verify the page has scrolled to the correct section
      cy.get(item.sectionSelector, { timeout: 10000 })
        .should("be.visible");

      // Step 4: Verify URL contains the correct hash
      cy.url().should("include", `#${item.expectedSection}`);

      // Step 5: Verify the section is actually in view
      cy.get(item.sectionSelector).should("be.inViewport");

      // Step 6: Wait for scroll to stabilize
      cy.wait(2000);

      // Step 7: Use ScrollCompanion's scroll-to-top feature
      if (index < navigationItems.length - 1) { // Don't scroll up after the last item
        cy.log("Using ScrollCompanion to scroll back to top");

        // The scroll companion should be visible when scrolled down
        cy.get(".scroll-companion__icon--clickable")
          .first() // Get the scroll-to-top icon (first clickable icon)
          .should("be.visible")
          .click();

        // Wait for smooth scroll to complete
        cy.wait(2000);

        // Verify we're back near the top (hero section should be visible)
        cy.get("[data-testid='hero-section'], .hero-section, #hero")
          .should("be.visible");

        // Verify URL no longer contains hash (or contains #hero)
        cy.url().should("satisfy", (url) => {
          return !url.includes("#") || url.includes("#hero") || url.endsWith("/");
        });
      }
    });
  });

  it("should test individual navigation functionality", () => {
    navigationItems.slice(0, 3).forEach((item, index) => {
      cy.log(`Individual test for: ${item.menuText}`);

      // Navigate to the section
      cy.get(".navigation-section__desktop-burger-button")
        .trigger("mouseenter");

      cy.get(".navigation-section__desktop-dropdown")
        .should("be.visible");

      cy.get(".navigation-section__dropdown-link")
        .contains(item.menuText)
        .click();

      // Verify navigation worked
      cy.get(item.sectionSelector).should("be.visible").and("be.inViewport");
      cy.url().should("include", `#${item.expectedSection}`);

      // Test scroll companion functionality
      cy.get(".scroll-companion", { timeout: 5000 })
        .should("be.visible");

      // Return to top using scroll companion
      cy.get(".scroll-companion__icon--clickable")
        .first()
        .click();

      cy.wait(2000);

      // Verify return to top
      cy.get("[data-testid='hero-section'], .hero-section, #hero")
        .should("be.visible");
    });
  });

  it("should handle burger menu hover states correctly", () => {
    // Test hover enter
    cy.get(".navigation-section__desktop-burger-button")
      .trigger("mouseenter");

    cy.get(".navigation-section__desktop-dropdown")
      .should("be.visible");

    // Verify all expected menu items are present
    navigationItems.forEach((item) => {
      cy.get(".navigation-section__dropdown-link")
        .contains(item.menuText)
        .should("be.visible");
    });

    // Test hover leave (mouse leaves the dropdown area)
    cy.get("body").trigger("mousemove", { clientX: 100, clientY: 100 });

    // Dropdown should disappear after delay
    cy.wait(200);
    cy.get(".navigation-section__desktop-dropdown")
      .should("not.exist");
  });

  it("should verify scroll companion behavior at different scroll positions", () => {
    // Initially, scroll companion should not be visible at top
    cy.get(".scroll-companion").should("not.be.visible");

    // Scroll down to make scroll companion appear
    cy.scrollTo(0, 500);
    cy.wait(1000);

    // Scroll companion should now be visible
    cy.get(".scroll-companion").should("be.visible");

    // Test scroll to top functionality
    cy.get(".scroll-companion__icon--clickable")
      .first()
      .click();

    cy.wait(2000);

    // Should be back at top
    cy.window().its("scrollY").should("be.lessThan", 100);
  });

  it("should test keyboard navigation accessibility", () => {
    // Focus on the burger button and test keyboard interaction
    cy.get(".navigation-section__desktop-burger-button")
      .focus()
      .trigger("mouseenter");

    cy.get(".navigation-section__desktop-dropdown").should("be.visible");

    // Test that dropdown links are focusable and clickable
    cy.get(".navigation-section__dropdown-link")
      .first()
      .focus()
      .should("be.focused")
      .type("{enter}");

    // Should navigate to the first section
    cy.url().should("include", "#");
  });
});
