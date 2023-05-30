import * as React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useCriteria } from '../context/CriteriaContext';

export default function SearchCheckbox(props: any) {

    const [checked, setChecked] = React.useState(true);
    const { searchCriteria } = useCriteria();

    React.useEffect(() => {
        initialCheck();
    }, [props])

    function initialCheck() {
        const text: string = (props.text === "Unbranded") ? "Foundation,SR Legacy" : "Branded"
        searchCriteria.dataType.includes(text) ? setChecked(true) : setChecked(false)
    }

    function update() {
        if (checked && !validCheck()) return 
        // update the search criteria 
        props.update(props.text, checked)
        setChecked(!checked)
    }

    // make sure at least one checkbox is checked
    function validCheck() {
        if (props.text === "Branded") {
            if (!searchCriteria.dataType.includes("Foundation,SR Legacy")) return false;
        }
        if (props.text === "Unbranded") {
            if (!searchCriteria.dataType.includes("Branded")) return false;
        }
        return true
    }

    return (
        <>
        <Pressable style={styles.overallView} onPress={() => { update() }}>
            <View style={styles.checkboxBorder}>
            <Checkbox.IOS
                color='black' theme={{dark: true}} 
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => { update() }}/>
            </View>
            <Text style={styles.checkboxText}>{props.text}</Text>
        </Pressable>
        </>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 7.5
    },
    checkboxBorder: {
        borderColor: 'black',
        borderWidth: 1.5,
        borderRadius: 5,
        padding: 2
    }
})