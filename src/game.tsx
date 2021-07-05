import { Component, h, State } from '@stencil/core'

import { reels } from './assets/reel-data/reels'
import { ReelData } from './models/reel-data'
import { ReelItemData } from './models/reel-item-data'

import gsap from 'gsap'

@Component({
  tag: 'game-main',
  styleUrl: 'game.scss'
})
export class GameMain {
  private jackpotRef: HTMLDivElement
  private winningItems: ReelItemData[] = []
  private winningCondition: number = 3
  private specialPicId: number = 1
  private animationDuration: number = 3
  private animationSpecialDuraiton: number = 1.5
  private animationJackpotDuraiton: number = 4

  private maxPicId: number = 12

  @State() reelsColRef: HTMLSlotReelElement[] = []
  @State() buttonDisabled: boolean = false
  @State() isSpecial: boolean = false
  @State() isJackpotAnimatioon: boolean = false

  private startSpin() {
    this.updateButtonState()

    Promise.all(this.startSpinAnimation()).then((visibleReelItems: ReelItemData[][]) => {
      this.getWinningReelItems(visibleReelItems.flat())
      this.sendWinningReelItems()

      if (this.isSpecial) {
        this.playSpecialAnimation().then(() => {
          Promise.all(this.startSpinAnimation()).then((visibleReelItems: ReelItemData[][]) => {
            this.getWinningReelItems(visibleReelItems.flat())
            this.sendWinningReelItems()
            this.updateButtonState()

            this.isSpecial = false
          })
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

  private startSpinAnimation() {
    const visibleItems: Promise<ReelItemData[]>[] = []

    for (let i = 0; i < this.reelsColRef.length; i++) {
      visibleItems.push(
        this.spinReelItem(this.reelsColRef[i])
      )
    }

    return visibleItems
  }

  private playSpecialAnimation(): Promise<boolean> {
    return new Promise(resolve =>
      gsap.to(this.jackpotRef,
        {
          onStart: () => {
            this.isJackpotAnimatioon = true
          },
          onComplete: () => {
            this.isJackpotAnimatioon = false
            resolve(true)
          },
          duration: this.animationJackpotDuraiton
        }
      )
    )
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
            <div
              ref={el => this.jackpotRef = el as HTMLDivElement}
              class={{
                "game-view__slot__top__jackpot": true,
                "special": this.isJackpotAnimatioon
              }}
            >
              <div class="game-view__slot__top__jackpot__text">
                Jackpot
              </div>
            </div>
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
