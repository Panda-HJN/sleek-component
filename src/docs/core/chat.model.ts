import {RxImmer} from "./rximmer.ts";
import {filter, interval, map, switchMap, tap} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

export interface ChatState {
    textList: string[];
    highestFrequencyText: string;
    frequency: number;
}

const INITIAL_STATE: ChatState = {
    textList: [],
    highestFrequencyText: '',
    frequency: 0,
};

export class ChatModel extends RxImmer<ChatState> {
    private chatMap: Map<string, number> = new Map<string, number>();

    constructor() {
        super(INITIAL_STATE);

        // 每隔4秒检查最高频率的聊天文本
        interval(4000).pipe(
            switchMap(() => this.state$.pipe(
                map(() => this.chatMap),
                distinctUntilChanged((prev, curr) => {
                    // 比较Map的键值对是否相同
                    if (prev.size !== curr.size) return false;
                    for (const [key, value] of prev) {
                        if (curr.get(key) !== value) return false;
                    }
                    return true;
                })
            )),
            tap(chatMap => {

                if (chatMap.size > 0) {
                    let highestFrequency = 0;
                    let highestFrequencyText = '';
                    chatMap.forEach((value, key) => {

                        if (value > highestFrequency) {
                            highestFrequency = value;
                            highestFrequencyText = key;
                        }
                    });


                    // 如果最高频率文本和次数没有变化，则清空chatMap
                    // 注意这里我们比较的是highestFrequencyText，而不是this.state.highestFrequencyText
                    if (highestFrequencyText === this.state$.value.highestFrequencyText && highestFrequency === this.state$.value.frequency) {
                        this.chatMap.clear();
                        this.setState(state => ({
                            ...state,
                            highestFrequencyText: '',
                            frequency: 0
                        }));
                    }
                    // 更新最高频率文本

                    this.setState(state => ({
                        ...state,
                        highestFrequencyText: highestFrequencyText,
                        highestFrequency: highestFrequency
                    }));
                }
            })

        ).subscribe();

        // 模拟信号源
        function generateRandomNumber() {
            const randomNum = Math.floor(Math.random() * 21); // 生成0到20之间的随机自然数
            return  Math.random() < 0.2 ? (Math.random() < 0.5 ? 8 : 16) : randomNum; // 调整8和16的概率

        }

        const signalSource = interval(300).pipe(
            map(() => generateRandomNumber()),
            filter(num => num >= 0 && num <= 20) // 确保数值在0到20之间
        );

        // 订阅信号源以开始生成随机数
        signalSource.subscribe({
            next: (randomNumber) => {
                this.addNewText("tt"+randomNumber.toString())
            },
            error: (err) => {
                console.error('Error:', err);
            },
            complete: () => {
                console.log('Signal source completed.');
            }
        });


    }

    addNewText(text: string) {
        this.setState(state => {
            const updatedTextList = [...state.textList, text];
            const count = this.chatMap.get(text) || 0;
            this.chatMap.set(text, count + 1);

            return {
                ...state,
                textList: updatedTextList
            };
        });
    }
}

export const chatModel = new ChatModel();
