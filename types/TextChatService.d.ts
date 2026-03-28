type TextChatService = TextChatService & {
	ChatWindowConfiguration: ChatWindowConfiguration;
	ChatInputBarConfiguration: ChatInputBarConfiguration;
	ChannelTabsConfiguration: ChannelTabsConfiguration;
	BubbleChatConfiguration: BubbleChatConfiguration & {
		UICorner: UICorner;
		UIPadding: UIPadding;
		UIGradient: UIGradient;
		ImageLabel: ImageLabel;
	};
}
