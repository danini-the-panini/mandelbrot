import { Controller } from "@hotwired/stimulus";

export default abstract class NavigationController extends Controller {
  static targets = [
    'app',
    'template'
  ]

  declare readonly appTarget: HTMLElement
  declare readonly templateTarget: HTMLTemplateElement

  connect() {
    if (location.hash) this.navigateToHash(location.href)
  }

  navigate({ currentTarget: { href } }: { currentTarget: HTMLAnchorElement }) {
    this.navigateToHash(href)
  }

  private navigateToHash(href) {
    let identifier = href.split('#')[1]

    this.renderTemplate(identifier)
  }

  private renderTemplate(identifier: string) {
    let dataTarget = `data-${identifier}-target`
    let node = this.templateTarget.content.cloneNode(true) as DocumentFragment

    node.querySelector('#controller')!.setAttribute('data-controller', identifier)
    node.querySelector('#canvas')!.setAttribute(dataTarget, 'canvas')
    node.querySelector('#output')!.setAttribute(dataTarget, 'output')
    node.querySelector('#run_button')!.setAttribute('data-action', `${identifier}#run`)

    this.appTarget.innerHTML = ''
    this.appTarget.appendChild(node)
  }
}
