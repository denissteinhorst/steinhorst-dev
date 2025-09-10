it('navigation', function () {
  cy.visit('http://localhost:3000/')
  // Scroll down to make the burger menu visible and interactive
  cy.scrollTo(0, 0);
  cy.get('[href="#skills"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#personality"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#projects"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#experiences"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#certifications"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#faq"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#testimonials"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
  // cy.scrollTo('top');
  // cy.get('.navigation-section__chevron-icon').click();
  // cy.get('[href="#contact"][role="menuitem"]').click();
  // cy.get('.i-lucide\\:arrow-up-circle').click();
});
