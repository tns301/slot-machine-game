import { Component, h, Prop, State, Method, Watch } from '@stencil/core'
import { ReelData } from '../models/reel-data'
import { ReelItemData } from '../models/reel-item-data'
import gsap from 'gsap'

@Component({
  tag: 'slot-reel'
})
export class GameReel {
  private parsedReelData: object[] = []
  private visibleItems: ReelItemData[] = []
  private loosingReelItems: ReelItemData[] = []

  private numberOfMovingItems: number = 36
  private numberOfVisibleItems: number = 3
  private numberOfReelItems: number = 0

  private delay: number = 0

  private movingHeight: number = 0
  private posItemsBottom: number = 0
  private wrapperHeight: number = 0

  private shuffleIndex: number = 0
  private maxShuffleIndex: number = 0

  @State() reelsRef: HTMLSlotReelItemElement[] = []

  @Prop() data: ReelData

  @Prop() winningReels: ReelItemData[] = []

  @Prop() duration: number

  componentWillLoad() {
    this.parseData()
  }

  componentDidLoad() {
    this.initAnimationSetting()
  }

  @Method()
  async spin(duration: number): Promise<ReelItemData[]> {
    return new Promise(resolve => {
      this.resetReelsState()

      this.playAnimation(duration).then(() => {
        this.computeNextIndex()
        this.getVisibleItems()

        resolve(this.visibleItems)
      })
    }
    )
  }

  @Watch('winningReels')
  handleWinningReels() {
    this.getLoosingItems()
    this.setLoosingItemsStyle(true)
    this.setWinningItemsStyle(true)
  }

  private getLoosingItems() {
    this.loosingReelItems = this.visibleItems

    for (let i = 0; i < this.winningReels.length; i++) {
      const winningItemIndex = this.loosingReelItems.findIndex((item: ReelItemData) => item.picId === this.winningReels[i].picId)
      this.loosingReelItems.splice(winningItemIndex, 1)
    }
  }

  private setWinningItemsStyle(value: boolean) {
    for (let i = 0; i < this.winningReels.length; i++) {
      const winningItemIndex = this.numberOfReelItems - this.winningReels[i].indexId - 1
      this.reelsRef[winningItemIndex].winning = value
    }
  }

  private setLoosingItemsStyle(value: boolean) {
    for (let i = 0; i < this.loosingReelItems.length; i++) {
      const loosingItemIndex = this.numberOfReelItems - this.loosingReelItems[i].indexId - 1
      this.reelsRef[loosingItemIndex].loosing = value
    }
  }

  private resetReelsState() {
    this.setLoosingItemsStyle(false)
    this.setWinningItemsStyle(false)

    this.loosingReelItems = []
    this.visibleItems = []
  }

  private computeNextIndex() {
    this.shuffleIndex -= this.numberOfMovingItems

    if (this.shuffleIndex < this.numberOfVisibleItems) {
      const diffNextIndex = this.shuffleIndex
      this.shuffleIndex = this.numberOfReelItems + diffNextIndex
    }
  }

  private getVisibleItems() {
    for (let i = 0; i < this.numberOfVisibleItems; i++) {
      let currentIndex = this.shuffleIndex - this.numberOfVisibleItems + i

      if (currentIndex > this.maxShuffleIndex) {
        currentIndex = Math.abs(currentIndex - this.numberOfReelItems)
      }

      this.visibleItems.push(this.parsedReelData[currentIndex] as ReelItemData)
    }
  }

  private parseData() {
    const idArray = this.randomiseIconArray()

    for (let i = idArray.length - 1; i >= 0; i--) {
      this.parsedReelData = [...this.parsedReelData,
      ...[
        {
          reelId: this.data['@id'],
          indexId: i,
          picId: +idArray[i],
        }
      ]
      ]
    }
  }

  private randomiseIconArray() {
    let arr = this.data.icons.split(',')
    const ranSplit = Math.floor(Math.random() * arr.length) + 1
    const splicedArr = arr.splice(0, ranSplit)

    return [...arr, ...splicedArr]
  }

  private initAnimationSetting() {
    this.numberOfReelItems = this.parsedReelData.length
    this.posItemsBottom = (this.numberOfReelItems - 1) * 100
    this.wrapperHeight = this.reelsRef.length * 100
    this.movingHeight = this.numberOfMovingItems * 100
    this.shuffleIndex = this.numberOfReelItems
    this.maxShuffleIndex = this.shuffleIndex - 1
    this.delay = (this.data['@id'] * 250) / 1000

    for (let i = 0; i < this.numberOfReelItems; i++) {
      gsap.set(this.reelsRef[i],
        {
          y: i * 100,
          width: 100,
          height: 100
        }
      )
    }

    gsap.set(this.reelsRef,
      {
        bottom: this.posItemsBottom
      }
    )
  }

  private playAnimation(duration: number): Promise<boolean> {
    return new Promise(resolve =>
      gsap.to(this.reelsRef,
        {
          y: `+=${this.movingHeight}`,
          modifiers: {
            y: (y) => {
              y = parseInt(y) % this.wrapperHeight;
              return `${y}px`;
            }
          },
          duration: duration,
          delay: this.delay,
          ease: 'back.inOut(0.75)',
          onComplete: () => {
            resolve(true)
          }
        }
      )
    )
  }

  render() {
    return (
      this.parsedReelData?.map((eachItem: ReelItemData, shuffleIndex: number) =>
        <slot-reel-item
          item={eachItem}
          ref={el => this.reelsRef[shuffleIndex] = el as HTMLSlotReelItemElement}
        >
        </slot-reel-item>
      )
    )
  }
}
