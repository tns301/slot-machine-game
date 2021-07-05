import { Component, h, Prop, Host } from '@stencil/core'

import { ReelItemData } from '../models/reel-item-data'

@Component({
  tag: 'slot-reel-item'
})
export class GameReelItem {
  @Prop() item: ReelItemData
  @Prop() loosing: boolean = false
  @Prop() winning: boolean = false

  render() {
    const path = `./../assets/icons/${this.item.picId}.svg`

    return (
      <Host class={{'looser': this.loosing, 'winner': this.winning}}>
        <img src={path} />
      </Host>
    )
  }
}
