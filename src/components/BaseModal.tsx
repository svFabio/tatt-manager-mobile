import React from 'react';
import { Modal, TouchableOpacity, View, ModalProps } from 'react-native';
import { COLORS } from '@/src/theme/colors';

interface BaseModalProps extends ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: number;
    hideCloseButton?: boolean;
    justifyContent?: 'center' | 'flex-end';
    overlayOpacity?: number;
    containerStyle?: object;
}

export const BaseModal = ({
    visible,
    onClose,
    children,
    maxWidth = 360,
    justifyContent = 'center',
    overlayOpacity = 0.7,
    containerStyle = {},
    ...props
}: BaseModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...props}>
            <View style={{ flex: 1, justifyContent, backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}>
                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={onClose} />
                <View style={{ padding: 24, alignItems: 'center' }}>
                    <View
                        style={[{
                            backgroundColor: COLORS.dark[100],
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: COLORS.border.subtle,
                            padding: 24,
                            width: '100%',
                            maxWidth,
                        }, containerStyle]}
                    >
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
