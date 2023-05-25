import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function SearchCheckbox(props: any) {
  const [checked, setChecked] = React.useState(false);

  return (
    <View style={styles.overallView}>
        <View style={styles.checkboxBorder}>
        <Checkbox.IOS
            color='black' theme={{dark: true}} 
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
            setChecked(!checked);
            }}
        />
        </View>
        <Text style={styles.checkboxText}>{props.text}</Text>
    </View>


  );
};

const styles = StyleSheet.create({
    checkboxText: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        marginLeft: 10
    },
    overallView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    checkboxBorder: {
        borderColor: 'black',
        borderWidth: 1.5,
        borderRadius: 5,
        padding: 2
    }
})