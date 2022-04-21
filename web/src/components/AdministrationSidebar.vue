<template>
  <div class="float-right">
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-2">
          Admin Navigation <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item to="/administration" exact>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-item to="/administration/assets" exact>
          <v-list-item-title>Assets</v-list-item-title>
        </v-list-item>

        <v-list-item to="/administration/transfers" exact>
          <v-list-item-title>Transfers</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/administration/tags" exact>
          <v-list-item-title>Tags</v-list-item-title>
        </v-list-item>

        <v-list-item to="/administration/users" exact>
          <v-list-item-title>Manage Users</v-list-item-title>
        </v-list-item>

        <v-list-item to="/administration/owners" exact>
          <v-list-item-title>Manage Owners</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>

  <!-- <v-card class="default">
          <v-card-content>
            <v-list dense>
              <v-list-item to="/administration" exact>
                <v-list-item-icon><v-icon>mdi-home</v-icon> </v-list-item-icon>
                <v-list-item-title>Administration</v-list-item-title>
              </v-list-item>

              <v-list-item to="/administration/users" exact>
                <v-list-item-icon
                  ><v-icon>mdi-account-multiple</v-icon>
                </v-list-item-icon>
                <v-list-item-title> Manage Users </v-list-item-title>
              </v-list-item>
              
              <v-list-item to="/administration/owners" exact>
                <v-list-item-icon
                  ><v-icon>mdi-bank</v-icon>
                </v-list-item-icon>
                <v-list-item-title> Manage Owners </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-content>
        </v-card> -->
</template>