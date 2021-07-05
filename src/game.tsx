import { Component, h, State } from '@stencil/core'

import { reels } from './assets/reel-data/reels'
import { ReelData } from './models/reel-data'
import { ReelItemData } from './models/reel-item-data'

@Component({
  tag: 'game-main',
  styleUrl: 'game.scss'
})
export class GameMain {
  private winningItems: ReelItemData[] = []
  private winningCondition: number = 3
  private specialPicId: number = 1
  private animationDuration: number = 3
  private animationSpecialDuraiton: number = 1.5

  private maxPicId: number = 12

  @State() reelsColRef: HTMLSlotReelElement[] = []
  @State() buttonDisabled: boolean = false
  @State() isSpecial: boolean = false

  private startSpin() {
    this.updateButtonState()

    Promise.all(this.playAnimation()).then((visibleReelItems: ReelItemData[][]) => {
      this.getWinningReelItems(visibleReelItems.flat())
      this.sendWinningReelItems()

      if (this.isSpecial) {
        Promise.all(this.playAnimation()).then((visibleReelItems: ReelItemData[][]) => {
          this.getWinningReelItems(visibleReelItems.flat())
          this.sendWinningReelItems()
          this.updateButtonState()

          this.isSpecial = false
        })
      } else {
        this.updateButtonState()
      }
    })
  }

  private updateButtonState() {
    this.buttonDisabled = !this.buttonDisabled
  }

  private getWinningReelItems(visibleReelItems: ReelItemData[]) {
    const winningItems: ReelItemData[][] = []

    for (let i = 1; i <= this.maxPicId; i++) {
      const items: ReelItemData[] = visibleReelItems.filter((item: ReelItemData) => item.picId === i)

      if (items.length >= this.winningCondition) {
        if (items[0].picId === this.specialPicId) {
          this.isSpecial = true
        }

        winningItems.push(items)
      }
    }

    this.winningItems = winningItems.flat()
  }

  private sendWinningReelItems() {
    for (let i = 0; i < this.reelsColRef.length; i++) {
      const winningReelColItems = this.winningItems.filter((item: ReelItemData) => {
        return item.reelId === i
      })

      this.reelsColRef[i].winningReels = winningReelColItems
    }
  }

  private playAnimation() {
    const visibleItems: Promise<ReelItemData[]>[] = []

    for (let i = 0; i < this.reelsColRef.length; i++) {
      visibleItems.push(
        this.spinReelItem(this.reelsColRef[i])
      )
    }

    return visibleItems
  }

  private async spinReelItem(reel: HTMLSlotReelElement) {
    const duration = this.isSpecial ? this.animationSpecialDuraiton : this.animationDuration
    
    return reel.spin(duration).then((value: ReelItemData[]) => {
      return value
    })
  }

  render() {
    return (
      <div class="game-view">
        <div class="game-view__slot">
          <div class="game-view__slot__top">
            <div class="game-view__slot__top__reels">
              {reels?.reels?.map((reelData: ReelData, index: number) =>
                <slot-reel
                  data={reelData}
                  ref={el => this.reelsColRef[index] = el as HTMLSlotReelElement}
                >
                </slot-reel>
              )}
            </div>
          </div>
          <div class="game-view__slot__bottom">
            <button class="game-view__slot__bottom__button" onClick={() => this.startSpin()} disabled={this.buttonDisabled}></button>
          </div>
        </div>
      </div>
    )
  }
}
