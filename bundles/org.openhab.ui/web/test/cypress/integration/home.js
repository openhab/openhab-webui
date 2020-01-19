describe('home page', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should have openHAB as <title>', () => {
    cy.title().should('include', 'openHAB')
  })
  it('should have an "other apps" sidebar"', () => {
    cy.get('.right > .link > .icon').click()
    cy.get('.other-apps > .navbar > .navbar-inner').should('contain', 'Other Apps')
  })
})
